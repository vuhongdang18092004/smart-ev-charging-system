import { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BaseInput } from '@/src/components/base/BaseInput';
import { BaseButton } from '@/src/components/base/BaseButton';
import { KeyboardAwareScreen } from '@/src/components/layout/KeyboardAwareScreen';
import { VEHICLE_COPY as copy, VEHICLE_NAME_MAX_LENGTH } from '../constants';
import { useVehicles } from '../hooks/useVehicles';

export function VehiclesScreen() {
  const [detailId, setDetailId] = useState<string>();
  const { data, loading, failed, detail, reload, busy, error, submit, save, remove: deleteVehicle } =
    useVehicles(detailId);
  const [form, setForm] = useState<{ id?: string; brand: string; option: string; name: string }>();
  const [message, setMessage] = useState('');
  const options = data?.options ?? [];
  const selectedModel = options.find((option) => option.id === form?.option);
  const brands = new Map(options.map((option) => [option.brand_id, option.brand_name]));

  function remove(id: string) {
    Alert.alert(copy.remove, copy.confirm, [
      { text: copy.cancel, style: 'cancel' },
      { text: copy.remove, style: 'destructive', onPress: () => void submit(async () => {
        setMessage('');
        await deleteVehicle(id);
        setMessage(copy.removed);
      }) },
    ]);
  }

  return (
    <KeyboardAwareScreen>
      <ThemedText type="title">{copy.title}</ThemedText>
      {loading && <ThemedText>{copy.loading}</ThemedText>}
      {failed && <>
        <ThemedText accessibilityRole="alert">{copy.error}</ThemedText>
        <BaseButton label={copy.retry} onPress={reload} />
      </>}
      {!!message && <ThemedText accessibilityLiveRegion="polite">{message}</ThemedText>}
      {!!error && <ThemedText accessibilityRole="alert">{error}</ThemedText>}
      {detailId && <>
        <ThemedText type="subtitle">{copy.detail}</ThemedText>
        {!detail && <ThemedText>{copy.loading}</ThemedText>}
        {detail?.failed && <ThemedText accessibilityRole="alert">{copy.error}</ThemedText>}
        {detail?.vehicle && <>
          <ThemedText type="subtitle">{detail.vehicle.name}</ThemedText>
          <ThemedText>
            {detail.vehicle.vehicle_option
              ? `${detail.vehicle.vehicle_option.brand_name} ${detail.vehicle.vehicle_option.model}`
              : copy.unavailable}
          </ThemedText>
        </>}
        <BaseButton label={copy.cancel} secondary onPress={() => setDetailId(undefined)} />
      </>}
      {data && !form && !detailId && <>
        <BaseButton label={copy.add} disabled={busy || !options.length}
          onPress={() => setForm({ brand: '', option: '', name: '' })} />
        {!options.length && <ThemedText>{copy.noOptions}</ThemedText>}
        {!data.vehicles.length && <ThemedText>{copy.empty}</ThemedText>}
        {data.vehicles.map((vehicle) => {
          const option = options.find((item) => item.id === vehicle.vehicle_info_id) ?? vehicle.vehicle_option;
          return <View key={vehicle.id} style={styles.row}>
            <ThemedText type="subtitle">{vehicle.name}</ThemedText>
            <ThemedText>
              {option ? `${option.brand_name} ${option.model}` : copy.unavailable}
            </ThemedText>
            <BaseButton label={copy.detail} disabled={busy} secondary onPress={() => setDetailId(vehicle.id)} />
            <BaseButton label={copy.edit} disabled={busy} secondary
              onPress={() => setForm({ id: vehicle.id, brand: option?.brand_id ?? '', option: option?.id ?? '', name: vehicle.name })} />
            <BaseButton label={copy.remove} disabled={busy} secondary onPress={() => remove(vehicle.id)} />
          </View>;
        })}
      </>}
      {data && form && <>
        <ThemedText type="subtitle">{form.id ? copy.edit : copy.add}</ThemedText>
        <ThemedText>{copy.brand}</ThemedText>
        {[...brands].map(([id, name]) => <BaseButton key={id} label={name} disabled={busy}
          secondary={form.brand !== id} onPress={() => setForm({ ...form, brand: id, option: '' })} />)}
        {!!form.brand && <>
          <ThemedText>{copy.model}</ThemedText>
          {options.filter((option) => option.brand_id === form.brand).map((option) =>
            <BaseButton key={option.id} label={option.model} disabled={busy}
              secondary={form.option !== option.id} onPress={() => setForm({ ...form, option: option.id })} />)}
        </>}
        <BaseInput label={copy.name} value={form.name} editable={!busy}
          maxLength={VEHICLE_NAME_MAX_LENGTH} placeholder={selectedModel?.model ?? copy.namePlaceholder}
          onChangeText={(name) => setForm({ ...form, name })} />
        <BaseButton label={copy.save} disabled={busy || !form.option} onPress={() => void submit(async () => {
          setMessage('');
          await save(form.option, form.name, form.id);
          setForm(undefined);
          setMessage(copy.saved);
        })} />
        <BaseButton label={copy.cancel} disabled={busy} secondary onPress={() => setForm(undefined)} />
      </>}
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({ row: { gap: 8, marginVertical: 8 } });
