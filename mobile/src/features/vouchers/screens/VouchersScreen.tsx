import { Alert, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { BaseButton } from '@/src/components/base/BaseButton';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { VoucherQrModal } from '../components/VoucherQrModal';
import { VOUCHER_COPY as copy, WALLET_TABS } from '../constants';
import { useVouchers } from '../hooks/useVouchers';
import type { VoucherOffer, VoucherView } from '../types/voucher';
import { deadline, discount, money, scope } from '../utils/formatVoucher';

function Offer({ voucher }: { voucher: VoucherOffer }) {
  return <>
    <ThemedText type="subtitle">{discount(voucher)} · {voucher.title}</ThemedText>
    {voucher.description && <ThemedText>{voucher.description}</ThemedText>}
    <ThemedText>{copy.applies} · {scope(voucher)}</ThemedText>
    <ThemedText>{copy.deadline} · {deadline(voucher.valid_to)}</ThemedText>
    {voucher.max_discount_amount !== null && <ThemedText>{copy.maximum} · {money(voucher.max_discount_amount)}</ThemedText>}
    {voucher.min_order_amount > 0 && <ThemedText>{copy.minimum} · {money(voucher.min_order_amount)}</ThemedText>}
  </>;
}

export function VouchersScreen() {
  const state = useVouchers();
  const borderColor = useThemeColor({}, 'icon');
  const sections: { view: VoucherView; label: string }[] = [
    { view: 'available', label: copy.available },
    { view: 'CLAIMED', label: copy.wallet },
  ];

  function confirm(id: string) {
    Alert.alert(copy.getQr, copy.confirm, [
      { text: copy.cancel, style: 'cancel' },
      { text: copy.getQr, onPress: () => void state.issueQr(id) },
    ]);
  }

  return (
    <KeyboardAwareScreen>
      <ThemedText type="title">{copy.title}</ThemedText>
      <View style={styles.buttons}>
        {sections.map(({ view, label }) => <BaseButton key={view} label={label}
          secondary={view === 'available' ? state.view !== view : state.view === 'available'}
          disabled={state.busy} onPress={() => state.select(view)} />)}
      </View>
      {state.view !== 'available' && <View style={styles.buttons}>
        {WALLET_TABS.map((view) => <BaseButton key={view} label={copy[view]}
          secondary={state.view !== view} disabled={state.busy} onPress={() => state.select(view)} />)}
      </View>}
      {state.loading && <ThemedText>{copy.loading}</ThemedText>}
      {!!state.error && <ThemedText accessibilityRole="alert">{state.error}</ThemedText>}
      {!!state.message && <ThemedText accessibilityLiveRegion="polite">{state.message}</ThemedText>}
      {state.failed && <>
        <ThemedText accessibilityRole="alert">{copy.failed}</ThemedText>
        <BaseButton label={copy.retry} onPress={state.refresh} />
      </>}
      {state.rows?.items.length === 0 && <ThemedText>{copy.empty}</ThemedText>}
      {state.rows?.view === 'available' ? state.rows.items.map((v) => (
        <View key={v.id} style={[styles.card, { borderColor }]}>
          <Offer voucher={v} />
          <ThemedText>{copy.remaining} · {v.total_quantity - v.claimed_count}</ThemedText>
          {v.is_claimed ? <ThemedText type="defaultSemiBold">{copy.claimed}</ThemedText> :
            <BaseButton label={copy.claim} disabled={state.busy} onPress={() => void state.claim(v.id)} />}
        </View>
      )) : state.rows?.items.map((item) => (
        <View key={item.id} style={[styles.card, { borderColor }]}>
          <Offer voucher={item.voucher} />
          <ThemedText type="defaultSemiBold">{item.redeem_code} · {copy[item.status]}</ThemedText>
          {item.status === 'CLAIMED' && <BaseButton label={copy.getQr} disabled={state.busy} onPress={() => confirm(item.id)} />}
          {item.status === 'USED' && item.qr_text && <BaseButton label={copy.showQr} onPress={() => state.showQr(item)} />}
        </View>
      ))}
      {state.total > 1 && <View style={styles.buttons}>
        <BaseButton label={copy.previous} secondary disabled={state.page === 0 || state.busy}
          onPress={() => state.setPage(state.page - 1)} />
        <BaseButton label={copy.next} secondary disabled={state.page + 1 >= state.total || state.busy}
          onPress={() => state.setPage(state.page + 1)} />
      </View>}
      {state.qr && <VoucherQrModal key={state.qr.voucher.id} voucher={state.qr.voucher}
        autoSave={state.qr.autoSave} onClose={state.closeQr} />}
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { gap: 8, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 16 },
});
