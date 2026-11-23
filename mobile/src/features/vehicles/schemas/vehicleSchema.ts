import { z } from 'zod';

import { VEHICLE_NAME_MAX_LENGTH } from '../constants';

export const vehicleSchema = z.object({
  vehicle_info_id: z.uuid(),
  name: z.string().max(VEHICLE_NAME_MAX_LENGTH).optional(),
});
