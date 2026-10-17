import { BACKUP_MAX_BYTES } from './backupPreview';
export type ExportResult = 'saved' | 'shared' | 'downloaded' | 'cancelled';

export const saveBackupFile = async (text: string, name: string, _title: string): Promise<ExportResult> => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'downloaded';
};
export const shareBackupFile = saveBackupFile;

export const pickBackupFile = (): Promise<{ name: string; text: string } | null> => new Promise((resolve, reject) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.txt,application/json,text/plain';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('cancel', () => { input.remove(); resolve(null); }, { once: true });
  input.addEventListener('change', async () => {
    try {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      if (file.size > BACKUP_MAX_BYTES) throw new Error('backup-too-large');
      resolve({ name: file.name, text: await file.text() });
    } catch (error) { reject(error); }
    finally { input.remove(); }
  }, { once: true });
  input.click();
});
