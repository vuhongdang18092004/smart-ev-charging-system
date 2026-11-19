import { z } from "zod";
import {
  BRAND_TYPES,
  COPY,
  CURRENT_TYPES,
  OPERATOR_ACCESS,
  STATION_ACCESS,
  STATION_STATUSES,
} from "@/constants/management";

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
  name: text(100),
  logo_url: optionalText(500),
  website: optionalText(500),
  type: z.enum(BRAND_TYPES, { error: COPY.required }),
});
export const connectorTypeSchema = z.object({
  code: text(20),
  name: text(100),
  current_type: z.enum(CURRENT_TYPES, { error: COPY.required }),
  active: checkbox,
  sort_order: integer(-2_147_483_648),
});
export const operatorSchema = z.object({
  name: text(100),
  email: text(255).pipe(z.email({ error: COPY.invalid })),
  password: z
    .string({ error: COPY.required })
    .min(8, COPY.passwordLength)
    .refine(
      (value) =>
        value.trim() !== "" && new TextEncoder().encode(value).length <= 72,
      COPY.passwordLength,
    ),
  access_type: z.enum(OPERATOR_ACCESS, { error: COPY.required }),
  api_endpoint: optionalText(500),
});
export const connectorSchema = z.object({
  connector_type_id: id,
  power_kw: optionalDecimal(4, 2, 9999.99),
  quantity: integer(1),
  price_per_kwh: optionalDecimal(8, 2, 99999999.99),
});
export const stationSchema = z.object({
  operator_id: id,
  brand_id: id,
  name: text(200),
  address: text(500),
  lat: decimal(3, 7, -90, 90),
  lng: decimal(3, 7, -180, 180),
  status: z.enum(STATION_STATUSES, { error: COPY.required }),
  is_24_7: checkbox,
  opening_time: time,
  closing_time: time,
  access_type: z.enum(STATION_ACCESS, { error: COPY.required }),
  source_url: optionalText(500),
});
export const createStationSchema = z.object({
  station: stationSchema,
  connectors: z.array(connectorSchema),
});
