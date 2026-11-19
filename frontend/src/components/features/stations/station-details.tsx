"use client";

import { useCallback, useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseModal } from "@/components/base/base-modal";
import { BaseTable } from "@/components/base/base-table";
import { COPY, VALUE_LABELS } from "@/constants/management";
import { useResource } from "@/hooks/use-resource";
import { connectorSchema } from "@/schemas/management";
import {
  addConnector,
  deleteConnector,
  deleteStation,
  getStation,
  updateConnector,
} from "@/services/station-service";
import type { Connector } from "@/types/management";
import type {
  StationDetailAction,
  StationDetailsProps,
} from "@/types/management-ui";
import { ConnectorFields } from "../connectors/connector-fields";
import { ManagedForm } from "../management/managed-form";
import { ResourceFeedback } from "../management/resource-feedback";
import { StationForm } from "./station-form";

export function StationDetails({
  id,
  brands,
  operators,
  types,
  onClose,
  onChange,
  onDelete,
}: StationDetailsProps) {
  const load = useCallback(
    (signal: AbortSignal) => getStation(id, signal),
    [id],
  );
  const detail = useResource(load);
  const [action, setAction] = useState<StationDetailAction>();
  const station = detail.data?.station;

  function refresh() {
    setAction(undefined);
    detail.refresh();
  }

  return (
    <BaseModal
      open
      title={station?.name ?? COPY.stationDetails}
      onClose={onClose}
      wide
    >
      <ResourceFeedback {...detail} />
      {station && detail.data && (
        <div className="grid gap-5">
          <div className="grid gap-3 rounded-xl bg-workspace p-4 text-sm sm:grid-cols-2">
            <span>
              <strong>{COPY.address}</strong> · {station.address}
            </span>
            <span>
              <strong>{COPY.status}</strong> ·{" "}
              {station.status ? VALUE_LABELS[station.status] : COPY.empty}
            </span>
            <span>
              <strong>{COPY.brand}</strong> ·{" "}
              {brands.find((brand) => brand.id === station.brand_id)?.name ??
                COPY.empty}
            </span>
            <span>
              <strong>{COPY.operator}</strong> ·{" "}
              {operators.find((operator) => operator.id === station.operator_id)
                ?.name ?? COPY.empty}
            </span>
            <span>
              <strong>
                {COPY.lat} / {COPY.lng}
              </strong>{" "}
              · {station.lat}, {station.lng}
            </span>
            <span>
              <strong>{COPY.access}</strong> ·{" "}
              {VALUE_LABELS[station.access_type]}
            </span>
            <span>
              <strong>
                {COPY.opening} / {COPY.closing}
              </strong>{" "}
              · {station.opening_time ?? COPY.empty} /{" "}
              {station.closing_time ?? COPY.empty}
            </span>
            <span>
              <strong>{COPY.allDay}</strong> ·{" "}
              {station.is_24_7 === null
                ? COPY.empty
                : station.is_24_7
                  ? COPY.enabled
                  : COPY.disabled}
            </span>
            <span className="break-all">
              <strong>{COPY.source}</strong> ·{" "}
              {station.source_url || COPY.empty}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <BaseButton onClick={() => setAction({ kind: "edit-station" })}>
              {COPY.editStation}
            </BaseButton>
            <BaseButton
              className="bg-red-700! text-white!"
              onClick={() => setAction({ kind: "delete-station" })}
            >
              {COPY.delete}
            </BaseButton>
          </div>
          <section className="grid gap-3 border-t border-line pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{COPY.connectors}</h3>
              <BaseButton
                disabled={!types.length}
                onClick={() => setAction({ kind: "edit-connector" })}
              >
                {COPY.addConnector}
              </BaseButton>
            </div>
            <BaseTable<Connector>
              caption={COPY.connectors}
              rows={detail.data.connectors}
              getRowKey={(row) => row.id}
              columns={[
                {
                  id: "type",
                  header: COPY.connectorType,
                  render: (row) =>
                    types.find((type) => type.id === row.connector_type_id)
                      ?.name ?? COPY.empty,
                },
                {
                  id: "power",
                  header: COPY.power,
                  render: (row) => row.power_kw ?? COPY.empty,
                },
                {
                  id: "quantity",
                  header: COPY.quantity,
                  render: (row) => row.quantity,
                },
                {
                  id: "price",
                  header: COPY.price,
                  render: (row) => row.price_per_kwh ?? COPY.empty,
                },
                {
                  id: "actions",
                  header: COPY.actions,
                  render: (row) => (
                    <div className="flex flex-wrap gap-2">
                      <BaseButton
                        onClick={() =>
                          setAction({ kind: "edit-connector", connector: row })
                        }
                      >
                        {COPY.edit}
                      </BaseButton>
                      <BaseButton
                        className="bg-red-700! text-white!"
                        onClick={() =>
                          setAction({ kind: "delete-connector", id: row.id })
                        }
                      >
                        {COPY.delete}
                      </BaseButton>
                    </div>
                  ),
                },
              ]}
            />
          </section>
        </div>
      )}
      {station && action?.kind === "edit-station" && (
        <BaseModal
          open
          title={COPY.editStation}
          onClose={() => setAction(undefined)}
          wide
        >
          <StationForm
            station={station}
            brands={brands}
            operators={operators}
            types={types}
            onSuccess={() => {
              refresh();
              onChange();
            }}
          />
        </BaseModal>
      )}
      {action?.kind === "edit-connector" && (
        <BaseModal
          open
          title={action.connector ? COPY.editConnector : COPY.addConnector}
          onClose={() => setAction(undefined)}
        >
          <ManagedForm
            submitLabel={action.connector ? COPY.save : COPY.create}
            onSuccess={refresh}
            submit={async (form) => {
              const body = connectorSchema.parse(Object.fromEntries(form));
              if (action.connector)
                await updateConnector(action.connector.id, body);
              else await addConnector(id, body);
            }}
          >
            <ConnectorFields types={types} connector={action.connector} />
          </ManagedForm>
        </BaseModal>
      )}
      {(action?.kind === "delete-station" ||
        action?.kind === "delete-connector") && (
        <BaseModal
          open
          title={COPY.confirmDelete}
          onClose={() => setAction(undefined)}
        >
          <ManagedForm
            submitLabel={COPY.delete}
            onSuccess={action.kind === "delete-station" ? onDelete : refresh}
            submit={() =>
              action.kind === "delete-station"
                ? deleteStation(id)
                : deleteConnector(action.id)
            }
          >
            <p className="text-sm">
              {action.kind === "delete-station"
                ? COPY.confirmStation
                : COPY.confirmConnector}
            </p>
          </ManagedForm>
        </BaseModal>
      )}
    </BaseModal>
  );
}
