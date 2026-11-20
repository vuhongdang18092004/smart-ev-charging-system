import { BaseInput } from "@/components/base/base-input";
import { BaseSelect } from "@/components/base/base-select";
import {
  CONNECTOR_CODE_LENGTH,
  CONNECTOR_DEFAULT_QUANTITY,
  CONNECTOR_DEFAULT_STATUS,
  CONNECTOR_MAX_QUANTITY,
  CONNECTOR_PORT_COPY,
  CONNECTOR_PREFIX_LENGTH,
  CONNECTOR_STATUSES,
  CONNECTOR_STATUS_LABELS,
} from "@/constants/connector-ports";
import { COPY } from "@/constants/management";
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
      <BaseSelect
        label={CONNECTOR_PORT_COPY.status}
        name={`${prefix}status`}
        defaultValue={connector?.status ?? CONNECTOR_DEFAULT_STATUS}
        options={CONNECTOR_STATUSES.map((value) => ({
          value,
          label: CONNECTOR_STATUS_LABELS[value],
        }))}
      />
      {connector ? (
        <BaseInput
          label={CONNECTOR_PORT_COPY.code}
          name={`${prefix}code`}
          maxLength={CONNECTOR_CODE_LENGTH}
          defaultValue={connector.code ?? ""}
        />
      ) : (
        <>
          <BaseInput
            label={CONNECTOR_PORT_COPY.quantity}
            name={`${prefix}quantity`}
            type="number"
            min={CONNECTOR_DEFAULT_QUANTITY}
            max={CONNECTOR_MAX_QUANTITY}
            step={1}
            required
            defaultValue={CONNECTOR_DEFAULT_QUANTITY}
          />
          <BaseInput
            label={CONNECTOR_PORT_COPY.codePrefix}
            name={`${prefix}code_prefix`}
            maxLength={CONNECTOR_PREFIX_LENGTH}
          />
        </>
      )}
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
