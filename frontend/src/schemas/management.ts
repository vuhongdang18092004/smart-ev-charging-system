import { z } from "zod";
import {
  CONNECTOR_CODE_LENGTH,
  CONNECTOR_DEFAULT_QUANTITY,
  CONNECTOR_DEFAULT_STATUS,
  CONNECTOR_MAX_QUANTITY,
  CONNECTOR_PREFIX_LENGTH,
  CONNECTOR_STATUSES,
} from "@/constants/connector-ports";
import {
  BRAND_TYPES,
  CATALOG_LIMITS,
  CONNECTOR_ACTIVITY,
  COPY,
  CURRENT_TYPES,
  OPERATOR_ACCESS,
  OPERATOR_STATUSES,
  STATION_ACCESS,
  STATION_STATUSES,
} from "@/constants/management";
import {
  LOCATION_TYPES,
  MEDIA_LIMITS,
  PARKING_FEE_TYPES,
} from "@/constants/station-media";
import { mediaSortSchema, mediaUrlSchema } from "./media";

const text = (max: number) =>
  z
    .string({ error: COPY.required })
    .trim()
    .min(1, COPY.required)
    .max(max, COPY.invalid);
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.string({ error: COPY.invalid }).trim().max(max, COPY.invalid).optional(),
  );
const id = z.uuid({ error: COPY.required });
const checkbox = z.preprocess(
  (value) => value === "on" || value === true,
  z.boolean(),
);
const decimal = (whole: number, fraction: number, min: number, max: number) =>
  z
    .string({ error: COPY.required })
    .trim()
    .min(1, COPY.required)
    .regex(
      new RegExp(`^[+-]?\\d{1,${whole}}(?:\\.\\d{1,${fraction}})?$`),
      COPY.invalid,
    )
    .transform(Number)
    .pipe(z.number().min(min, COPY.invalid).max(max, COPY.invalid));
const optionalDecimal = (whole: number, fraction: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    decimal(whole, fraction, 0, max).optional(),
  );
const coordinate = (min: number, max: number) =>
  z
    .string({ error: COPY.required })
    .trim()
    .regex(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i, COPY.invalid)
    .transform(Number)
    .pipe(
      z
        .number({ error: COPY.invalid })
        .min(min, COPY.invalid)
        .max(max, COPY.invalid),
    );
const integer = (min: number) =>
  z
    .string({ error: COPY.required })
    .trim()
    .regex(/^-?\d+$/, COPY.invalid)
    .transform(Number)
    .pipe(z.int().min(min, COPY.invalid).max(2_147_483_647, COPY.invalid));
const time = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.iso.time({ error: COPY.invalid }).optional(),
);

export const brandSchema = z.object({
  name: text(CATALOG_LIMITS.name),
  logo_url: optionalText(CATALOG_LIMITS.url),
  website: optionalText(CATALOG_LIMITS.url),
  type: z.enum(BRAND_TYPES, { error: COPY.required }),
});
const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;
export const updateBrandSchema = brandSchema.extend({
  type: z.preprocess(emptyToUndefined, brandSchema.shape.type.optional()),
});
export const connectorTypeSchema = z.object({
  code: text(CATALOG_LIMITS.code),
  name: text(CATALOG_LIMITS.name),
  current_type: z.enum(CURRENT_TYPES, { error: COPY.required }),
  active: checkbox,
  sort_order: integer(CATALOG_LIMITS.intMin),
});
export const updateConnectorTypeSchema = connectorTypeSchema
  .omit({ active: true })
  .extend({
    is_active: z.preprocess(
      emptyToUndefined,
      z
        .enum(CONNECTOR_ACTIVITY, { error: COPY.invalid })
        .transform((value) => value === CONNECTOR_ACTIVITY.active)
        .optional(),
    ),
    sort_order: z.preprocess(
      emptyToUndefined,
      connectorTypeSchema.shape.sort_order.optional(),
    ),
  });
export const operatorSchema = z.object({
  name: text(CATALOG_LIMITS.name),
  email: text(CATALOG_LIMITS.email).pipe(z.email({ error: COPY.invalid })),
  password: z
    .string({ error: COPY.required })
    .min(CATALOG_LIMITS.passwordMin, COPY.passwordLength)
    .refine(
      (value) =>
        value.trim() !== "" &&
        new TextEncoder().encode(value).length <= CATALOG_LIMITS.passwordBytes,
      COPY.passwordLength,
    ),
  access_type: z.enum(OPERATOR_ACCESS, { error: COPY.required }),
  api_endpoint: optionalText(CATALOG_LIMITS.url),
});
export const updateOperatorSchema = operatorSchema.extend({
  status: z.preprocess(
    emptyToUndefined,
    z.enum(OPERATOR_STATUSES, { error: COPY.invalid }).optional(),
  ),
  password: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? undefined
        : emptyToUndefined(value),
    operatorSchema.shape.password.optional(),
  ),
});
export const inviteOperatorSchema = operatorSchema.pick({
  name: true,
  email: true,
});
export const allowedBrandsSchema = z.object({ brandIds: z.array(id) });
export const connectorSchema = z.object({
  connector_type_id: id,
  power_kw: optionalDecimal(4, 2, 9999.99),
  price_per_kwh: optionalDecimal(8, 2, 99999999.99),
  code: optionalText(CONNECTOR_CODE_LENGTH),
  status: z.enum(CONNECTOR_STATUSES, { error: COPY.required }),
});
export const createConnectorsSchema = connectorSchema
  .omit({ code: true })
  .extend({
    code_prefix: optionalText(CONNECTOR_PREFIX_LENGTH),
    status: connectorSchema.shape.status.default(CONNECTOR_DEFAULT_STATUS),
    quantity: z.preprocess(
      (value) => emptyToUndefined(value) ?? String(CONNECTOR_DEFAULT_QUANTITY),
      integer(CONNECTOR_DEFAULT_QUANTITY).pipe(
        z.number().max(CONNECTOR_MAX_QUANTITY, COPY.invalid),
      ),
    ),
  });
export const stationImageSchema = z.object({
  url: mediaUrlSchema,
  caption: optionalText(MEDIA_LIMITS.caption),
  is_primary: checkbox,
  sort_order: mediaSortSchema,
});
export const stationSchema = z.object({
  operator_id: id.optional(),
  brand_id: id,
  name: text(200),
  address: text(500),
  lat: coordinate(-90, 90),
  lng: coordinate(-180, 180),
  status: z.enum(STATION_STATUSES, { error: COPY.required }),
  is_24_7: checkbox,
  opening_time: time,
  closing_time: time,
  access_type: z.enum(STATION_ACCESS, { error: COPY.required }),
  source_url: optionalText(500),
  location_type: z.enum(LOCATION_TYPES, { error: COPY.required }),
  parking_fee_type: z.enum(PARKING_FEE_TYPES, { error: COPY.required }),
  images: z.array(stationImageSchema).optional(),
});
export const createStationSchema = z.object({
  station: stationSchema,
  connectors: z.array(createConnectorsSchema),
});
