import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFS from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { BACKUP_MAX_BYTES } from './backupPreview';

export type ExportResult = 'saved' | 'shared' | 'downloaded' | 'cancelled';

export const shareBackupFile = async (text: string, name: string, title: string): Promise<ExportResult> => {
  if (!await Sharing.isAvailableAsync()) throw new Error('sharing-unavailable');
  const directory = new Directory(Paths.cache, 'ssak-backup-exports');
  directory.create({ idempotent: true });
  for (const old of directory.list()) {
    if (old instanceof File && old.modificationTime && old.modificationTime < Date.now() - 86400000) {
      try { old.delete(); } catch { /* Cache cleanup must not block a new export. */ }
    }
  }
  const file = new File(directory, name);
  file.create({ overwrite: true });
  file.write(text);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: title });
  // Android can resolve before the receiving app reads the file. Keep it in cache.
  // The share sheet does not tell us whether the user actually saved the file.
  return 'shared';
};

export const saveBackupFile = async (text: string, name: string, title: string): Promise<ExportResult> => {
  if (Platform.OS !== 'android') return shareBackupFile(text, name, title);
  const permission = await LegacyFS.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permission.granted) return 'cancelled';
  const uri = await LegacyFS.StorageAccessFramework.createFileAsync(permission.directoryUri, name.replace(/\.json$/, ''), 'application/json');
  try {
    await LegacyFS.writeAsStringAsync(uri, text);
  } catch (error) {
    await LegacyFS.deleteAsync(uri, { idempotent: true }).catch(() => {});
    throw error;
  }
  return 'saved';
};

export const pickBackupFile = async (): Promise<{ name: string; text: string } | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*', multiple: false, copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const file = new File(asset.uri);
  try {
    if ((asset.size ?? file.size) > BACKUP_MAX_BYTES) throw new Error('backup-too-large');
    return { name: asset.name, text: await file.text() };
  } finally {
    // Only remove the picker's temporary copy, never the user's original document.
    if (file.uri.startsWith(Paths.cache.uri) && file.exists) file.delete();
  }
};
