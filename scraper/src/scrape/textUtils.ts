export function normalizeText(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

export function safeText(value: string | null | undefined, fallback = 'Unknown') {
  const text = normalizeText(value);
  return text.length > 0 ? text : fallback;
}

export function parseNumber(value: string | null | undefined) {
  const text = normalizeText(value).replace(',', '.');
  const match = text.match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function parseRatio(value: string | null | undefined) {
  const text = normalizeText(value).replace(',', '.');
  const match = text.match(/(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)/);
  if (!match) {
    return { score: null, maxScore: null };
  }

  return {
    score: Number(match[1]),
    maxScore: Number(match[2])
  };
}

export function parsePercentage(value: string | null | undefined) {
  const text = normalizeText(value).replace(',', '.');
  const match = text.match(/(-?\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : null;
}

export function detectStatusFromText(value: string | null | undefined) {
  const text = normalizeText(value).toLowerCase();

  if (!text) {
    return 'unknown' as const;
  }

  if (/(overdue|late|missed)/.test(text)) {
    return 'overdue' as const;
  }

  if (/(submitted|completed|turned in|done)/.test(text)) {
    return 'submitted' as const;
  }

  if (/(pending|due|open|to do|in progress)/.test(text)) {
    return 'pending' as const;
  }

  return 'unknown' as const;
}
