import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  permission: vi.fn(), create: vi.fn(), write: vi.fn(), remove: vi.fn(),
  pick: vi.fn(), read: vi.fn(), deleteFile: vi.fn(), share: vi.fn(),
}));
vi.mock('react-native', () => ({ Platform: { OS: 'android' } }));
vi.mock('expo-file-system/legacy', () => ({
  StorageAccessFramework: { requestDirectoryPermissionsAsync: mocks.permission, createFileAsync: mocks.create },
  writeAsStringAsync: mocks.write, deleteAsync: mocks.remove,
}));
vi.mock('expo-file-system', () => ({
  Paths: { cache: { uri: 'file:///cache/' } },
  Directory: class { create() {} list() { return []; } },
  File: class {
    uri: string; exists = true; size = 12;
    constructor(uri: string) { this.uri = uri; }
    text = mocks.read; delete = mocks.deleteFile;
    create() {} write() {}
  },
}));
vi.mock('expo-document-picker', () => ({ getDocumentAsync: mocks.pick }));
vi.mock('expo-sharing', () => ({ isAvailableAsync: async () => true, shareAsync: mocks.share }));
import { pickBackupFile, saveBackupFile, shareBackupFile } from '../src/renewal/backupFile';
import { previewBackup } from '../src/renewal/backupPreview';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.permission.mockResolvedValue({ granted: true, directoryUri: 'content://chosen' });
  mocks.create.mockResolvedValue('content://chosen/backup.json');
  mocks.write.mockResolvedValue(undefined);
  mocks.remove.mockResolvedValue(undefined);
});
it('cancelled directory selection does not create a file', async () => {
  mocks.permission.mockResolvedValue({ granted: false });
  expect(await saveBackupFile('{}', 'backup.json', 'Save')).toBe('cancelled');
  expect(mocks.create).not.toHaveBeenCalled();
});
it('failed file write removes the incomplete file and does not report success', async () => {
  mocks.write.mockRejectedValue(new Error('disk-full'));
  await expect(saveBackupFile('{}', 'backup.json', 'Save')).rejects.toThrow('disk-full');
  expect(mocks.remove).toHaveBeenCalledWith('content://chosen/backup.json', { idempotent: true });
});
it('share does not delete the file before the receiving app reads it', async () => {
  expect(await shareBackupFile('{}', 'backup.json', 'Share')).toBe('shared');
  expect(mocks.deleteFile).not.toHaveBeenCalled();
});
it('cancelled picker is a no-op', async () => {
  mocks.pick.mockResolvedValue({ canceled: true });
  expect(await pickBackupFile()).toBeNull();
  expect(mocks.read).not.toHaveBeenCalled();
});
it('oversized import is rejected before reading and only its cache copy is removed', async () => {
  mocks.pick.mockResolvedValue({ canceled: false, assets: [{ name: 'big.json', uri: 'file:///cache/import.json', size: 10000001 }] });
  await expect(pickBackupFile()).rejects.toThrow('backup-too-large');
  expect(mocks.read).not.toHaveBeenCalled();
  expect(mocks.deleteFile).toHaveBeenCalledOnce();
});
it('picker never deletes the original file outside its cache', async () => {
  mocks.pick.mockResolvedValue({ canceled: false, assets: [{ name: 'backup.json', uri: 'content://original' }] });
  mocks.read.mockResolvedValue('{}');
  expect(await pickBackupFile()).toEqual({ name: 'backup.json', text: '{}' });
  expect(mocks.deleteFile).not.toHaveBeenCalled();
});
it('legacy text backups remain valid without a date; BOM is accepted', () => {
  const old = { format: 'ssak-backup', version: 1, habits: [], logs: [] };
  expect(previewBackup('\uFEFF' + JSON.stringify(old), 'old.json').exportedAt).toBeNull();
  expect(previewBackup(JSON.stringify({ ...old, exportedAt: 'wrong' }), 'old.json').exportedAt).toBeNull();
  expect(() => previewBackup('{"habits":[]}', 'broken.json')).toThrow();
});
