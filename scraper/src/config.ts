type ScraperConfig = {
  projectId: string | null;
  clientEmail: string | null;
  privateKey: string | null;
  userId: string;
  firestoreEmulatorHost: string | null;
};

function readEnv(name: string) {
  const value = process.env[name];
  return value && value.trim() ? value : null;
}

export function getScraperConfig(): ScraperConfig {
  return {
    projectId: readEnv('FIREBASE_PROJECT_ID'),
    clientEmail: readEnv('FIREBASE_CLIENT_EMAIL'),
    privateKey: readEnv('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n') ?? null,
    userId: readEnv('SCRAPER_USER_ID') ?? 'local-user',
    firestoreEmulatorHost: readEnv('SCRAPER_FIRESTORE_EMULATOR_HOST')
  };
}
