import { z } from "zod";

export const vehicleInfoSchema = z.object({
  brand_id: z.uuid(),
  model: z.string().trim().min(1).max(100),
  battery_kwh: z.coerce.number().positive().max(999999.99),
  range_nedc_km: z.coerce.number().int().min(0).max(2147483647),
});
