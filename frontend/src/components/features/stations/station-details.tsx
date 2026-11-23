"use client";

import { useCallback, useState } from "react";
import { BaseButton } from "@/components/base/base-button";
import { BaseModal } from "@/components/base/base-modal";
import { BaseTable } from "@/components/base/base-table";
import {
  CONNECTOR_PORT_COPY,
  CONNECTOR_STATUS_LABELS,
} from "@/constants/connector-ports";
import { COPY, VALUE_LABELS } from "@/constants/management";
import { STATION_MEDIA_COPY } from "@/constants/station-media";
import { useResource } from "@/hooks/use-resource";
import { connectorSchema, createConnectorsSchema } from "@/schemas/management";
import {
  addConnectors,
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
import { formatStationRating } from "@/utils/station-media";
import { ConnectorFields } from "../connectors/connector-fields";
import { ManagedForm } from "../management/managed-form";
import { ResourceFeedback } from "../management/resource-feedback";
import { StationForm } from "./station-form";
import { StationFeedback } from "./station-feedback";
import { StationImageGallery } from "./station-image-gallery";

const connectorOrder = new Intl.Collator("vi-VN", { numeric: true });

export function StationDetails({
  canManageFeedback,
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
  const detail = useResource(load, true);
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
              <strong>{STATION_MEDIA_COPY.locationType}</strong> ·{" "}
              {STATION_MEDIA_COPY.location[station.location_type]}
            </span>
            <span>
              <strong>{STATION_MEDIA_COPY.parkingFeeType}</strong> ·{" "}
              {STATION_MEDIA_COPY.parking[station.parking_fee_type]}
            </span>
            <span>
              <strong>{STATION_MEDIA_COPY.rating}</strong> ·{" "}
              {formatStationRating(station.avg_rating, station.rating_count)}
            </span>
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
          <StationImageGallery images={station.images ?? []} />
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
              rows={detail.data.connectors.toSorted((left, right) =>
                connectorOrder.compare(left.code ?? "", right.code ?? ""),
              )}
              getRowKey={(row) => row.id}
              columns={[
                {
                  id: "code",
                  header: CONNECTOR_PORT_COPY.code,
                  render: (row) => row.code ?? COPY.empty,
                },
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
                  id: "status",
                  header: CONNECTOR_PORT_COPY.status,
                  render: (row) => (
                    <span className="inline-flex rounded-full bg-workspace px-2 py-1 text-xs font-medium">
                      {CONNECTOR_STATUS_LABELS[row.status] ?? COPY.empty}
                    </span>
                  ),
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
          {canManageFeedback && (
            <StationFeedback
              stationId={id}
              types={types}
              onReviewSubmitted={() => {
                detail.refresh();
                onChange();
              }}
            />
          )}
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
            operatorLocked={!canManageFeedback}
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
              const fields = Object.fromEntries(form);
              if (action.connector) {
                await updateConnector(
                  action.connector.id,
                  connectorSchema.parse(fields),
                );
              } else {
                await addConnectors(id, createConnectorsSchema.parse(fields));
              }
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
