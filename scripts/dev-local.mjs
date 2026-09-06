import { spawn } from 'node:child_process';
import net from 'node:net';

const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8080;
const PROJECT_ID = 'blackscrapper-local';

function spawnProcess(command, args, envOverrides = {}) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...envOverrides
    }
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exitCode = 1;
      return;
    }

    if (typeof code === 'number' && code !== 0) {
      process.exitCode = code;
      shutdown();
    }
  });

  return child;
}

function waitForPort(host, port, timeoutMs = 120000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect(port, host);

      socket.on('connect', () => {
        socket.end();
        resolve();
      });

      socket.on('error', () => {
        socket.destroy();

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }

        setTimeout(attempt, 1000);
      });
    };

    attempt();
  });
}

let emulatorProcess;
let webProcess;
let scraperProcess;

function shutdown() {
  for (const child of [scraperProcess, webProcess, emulatorProcess]) {
    if (child && !child.killed) {
      child.kill('SIGINT');
    }
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});

async function main() {
  console.log('Starting Firestore emulator...');
  emulatorProcess = spawnProcess('firebase', [
    'emulators:start',
    '--only',
    'firestore',
    '--project',
    PROJECT_ID
  ]);

  console.log(`Waiting for Firestore emulator at ${FIRESTORE_HOST}:${FIRESTORE_PORT}...`);
  await waitForPort(FIRESTORE_HOST, FIRESTORE_PORT);

  console.log('Starting web app...');
  webProcess = spawnProcess('npm', ['--workspace', 'web', 'run', 'dev'], {
    VITE_USE_FIREBASE_EMULATOR: 'true',
    VITE_FIRESTORE_EMULATOR_HOST: FIRESTORE_HOST,
    VITE_FIRESTORE_EMULATOR_PORT: String(FIRESTORE_PORT),
    VITE_FIREBASE_PROJECT_ID: PROJECT_ID
  });

  console.log('Starting scraper...');
  scraperProcess = spawnProcess('npm', ['--workspace', 'scraper', 'run', 'dev'], {
    FIREBASE_PROJECT_ID: PROJECT_ID,
    SCRAPER_FIRESTORE_EMULATOR_HOST: `${FIRESTORE_HOST}:${FIRESTORE_PORT}`
  });
}

main().catch((error) => {
  console.error(error);
  shutdown();
  process.exit(1);
});
