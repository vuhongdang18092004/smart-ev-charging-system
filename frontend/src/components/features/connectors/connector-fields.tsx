import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import { CONNECTOR_DEFAULT_QUANTITY, COPY } from "@/constants/management";
import type { ConnectorFieldsProps } from "@/types/management-ui";
import { namedOptions } from "@/utils/management-options";

export function ConnectorFields({
  types,
  connector,
  prefix = "",
}: ConnectorFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <BaseSelect
        label={COPY.connectorType}
        name={`${prefix}connector_type_id`}
        required
        defaultValue={connector?.connector_type_id ?? ""}
        options={[{ value: "", label: COPY.select }, ...namedOptions(types)]}
      />
      <BaseInput
        label={COPY.quantity}
        name={`${prefix}quantity`}
        inputMode="numeric"
        required
        defaultValue={connector?.quantity ?? CONNECTOR_DEFAULT_QUANTITY}
      />
      <BaseInput
        label={COPY.power}
        name={`${prefix}power_kw`}
        inputMode="decimal"
        defaultValue={connector?.power_kw ?? ""}
      />
      <BaseInput
        label={COPY.price}
        name={`${prefix}price_per_kwh`}
        inputMode="decimal"
        defaultValue={connector?.price_per_kwh ?? ""}
      />
    </div>
  );
}
