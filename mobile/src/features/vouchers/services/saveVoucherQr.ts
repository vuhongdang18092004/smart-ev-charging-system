import { File, Paths } from 'expo-file-system';
import { requestPermissionsAsync, saveToLibraryAsync } from 'expo-media-library';
import { Platform } from 'react-native';

export async function allowVoucherQrSave() {
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) return true;
  return (await requestPermissionsAsync(true, [])).granted;
}

export async function saveVoucherQr(id: string, base64: string) {
  const file = new File(Paths.cache, `voucher-${id}.png`);
  file.create({ overwrite: true });
  try {
    file.write(base64, { encoding: 'base64' });
    await saveToLibraryAsync(file.uri);
  } finally {
    if (file.exists) file.delete();
  }
}
