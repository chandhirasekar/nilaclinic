export function getStoreAliases(code?: string): string[] {
  if (!code || code === 'ALL') return [];
  const c = code.toUpperCase().trim();
  const mapping: Record<string, string[]> = {
    'THN': ['NILA-TH', 'THN', 'TH'],
    'TH': ['NILA-TH', 'THN', 'TH'],
    'NILA-TH': ['NILA-TH', 'THN', 'TH'],
    'MDU': ['NILA-MD', 'MDU', 'MD'],
    'MD': ['NILA-MD', 'MDU', 'MD'],
    'NILA-MD': ['NILA-MD', 'MDU', 'MD'],
    'CHN': ['NILA-CH', 'CHN', 'CH'],
    'CH': ['NILA-CH', 'CHN', 'CH'],
    'NILA-CH': ['NILA-CH', 'CHN', 'CH'],
    'CBE': ['NILA-CB', 'CBE', 'CB'],
    'CB': ['NILA-CB', 'CBE', 'CB'],
    'NILA-CB': ['NILA-CB', 'CBE', 'CB'],
    'TRC': ['NILA-TR', 'TRC', 'TR'],
    'TR': ['NILA-TR', 'TRC', 'TR'],
    'NILA-TR': ['NILA-TR', 'TRC', 'TR'],
    'PUD': ['NILA-PUD', 'PUD'],
    'NILA-PUD': ['NILA-PUD', 'PUD'],
  };
  return mapping[c] || [c, c.replace('NILA-', ''), `NILA-${c}`];
}

export function canonicalStoreCode(code?: string): string {
  if (!code || code === 'ALL') return 'NILA-TH';
  const c = code.toUpperCase().trim();
  const aliases = getStoreAliases(c);
  const nila = aliases.find((a) => a.startsWith('NILA-'));
  return nila || c;
}

