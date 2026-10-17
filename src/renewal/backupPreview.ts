import { parseBackup } from './domain';

export const BACKUP_MAX_BYTES = 10_000_000;
export const backupFileName = (date = new Date()): string =>
  `ssak-backup-${date.toISOString().replace(/[:.]/g, '-')}.json`;

export const previewBackup = (text: string, name: string) => {
  const data = parseBackup(text.replace(/^\uFEFF/, ''));
  const { exportedAt } = JSON.parse(text.replace(/^\uFEFF/, ''));
  return {
    name, data,
    exportedAt: typeof exportedAt === 'string' && Number.isFinite(Date.parse(exportedAt))
      ? exportedAt : null,
  };
};
export type BackupPreview = ReturnType<typeof previewBackup>;
