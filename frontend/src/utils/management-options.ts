import { VALUE_LABELS } from "@/constants/management";

export function valueOptions(values: readonly (keyof typeof VALUE_LABELS)[]) {
  return values.map((value) => ({ value, label: VALUE_LABELS[value] }));
}

export function namedOptions(items: readonly { id: string; name: string }[]) {
  return items.map(({ id, name }) => ({ value: id, label: name }));
}
