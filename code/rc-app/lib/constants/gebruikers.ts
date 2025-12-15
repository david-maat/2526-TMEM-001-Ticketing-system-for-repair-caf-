// Centralised gebruiker type constants and helpers
export const GEBRUIKER_TYPES = [
  { key: 'admin', id: 1, dbName: 'Admin', label: 'Admin' },
  { key: 'balie', id: 2, dbName: 'Balie', label: 'Balie' },
  { key: 'student', id: 3, dbName: 'Student', label: 'Student' },
];

export const getGebruikerTypeIdFromKey = (key?: string) => {
  if (!key) return 2;
  return GEBRUIKER_TYPES.find((t) => t.key === key)?.id ?? 2;
};

export const getKeyFromDbName = (dbName?: string) => {
  if (!dbName) return 'balie';
  return GEBRUIKER_TYPES.find((t) => t.dbName.toLowerCase() === dbName.toLowerCase())?.key ?? 'balie';
};

export const getLabelFromKey = (key?: string) => {
  if (!key) return '';
  return GEBRUIKER_TYPES.find((t) => t.key === key)?.label ?? key;
};

export const isStudentKey = (key?: string) => key === 'student';
