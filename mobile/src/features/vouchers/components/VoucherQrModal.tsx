import { useRef, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type Svg from 'react-native-svg';
import { ThemedText } from '@/components/themed-text';
import { BaseButton } from '@/src/components/base/BaseButton';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { VOUCHER_COPY as copy } from '../constants';
import { allowVoucherQrSave, saveVoucherQr } from '../services/saveVoucherQr';
import type { WalletVoucher } from '../types/voucher';
import { deadline, discount, scope } from '../utils/formatVoucher';

export function VoucherQrModal({ voucher, autoSave, onClose }: {
  voucher: WalletVoucher; autoSave: boolean; onClose: () => void;
}) {
  const svg = useRef<Svg | null>(null);
  const saving = useRef(false);
  const attemptedAutoSave = useRef(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string>(copy.issued);

  async function save() {
    if (saving.current) return;
    const image = svg.current;
    if (!image) { setFeedback(copy.savingFailed); return; }
    saving.current = true;
    setBusy(true);
    try {
      if (!await allowVoucherQrSave()) { setFeedback(copy.permission); return; }
      const base64 = await new Promise<string>((resolve) => image.toDataURL(resolve));
      await saveVoucherQr(voucher.id, base64);
      setFeedback(copy.saved(deadline(voucher.voucher.valid_to)));
    } catch {
      setFeedback(copy.savingFailed);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  function shown() {
    if (autoSave && !attemptedAutoSave.current) {
      attemptedAutoSave.current = true;
      void save();
    }
  }

  return (
    <Modal visible animationType="slide" onShow={shown} onRequestClose={() => { if (!busy) onClose(); }}>
      <KeyboardAwareScreen>
        <ThemedText type="title">{voucher.voucher.title}</ThemedText>
        <ThemedText type="subtitle">{voucher.redeem_code}</ThemedText>
        {voucher.qr_text && <View style={styles.qr}>
          <QRCode value={voucher.qr_text} size={230} quietZone={20} getRef={(ref: Svg | null) => { svg.current = ref; }} />
        </View>}
        <ThemedText>{discount(voucher.voucher)} · {scope(voucher.voucher)}</ThemedText>
        <ThemedText>{copy.deadline} · {deadline(voucher.voucher.valid_to)}</ThemedText>
        <ThemedText accessibilityLiveRegion="polite">{feedback}</ThemedText>
        <BaseButton label={busy ? copy.saving : copy.saveQr} disabled={busy || !voucher.qr_text} onPress={() => void save()} />
        <BaseButton label={copy.close} disabled={busy} onPress={onClose} secondary />
      </KeyboardAwareScreen>
    </Modal>
  );
}

const styles = StyleSheet.create({ qr: { alignSelf: 'center' } });
