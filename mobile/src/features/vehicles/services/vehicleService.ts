import { axiosClient } from '@/src/lib/api/axiosClient';
import { vehicleSchema } from '../schemas/vehicleSchema';
import type { UserVehicle, VehicleOption, VehiclePage } from '../types/vehicles';

const vehicles = '/user-vehicles';
const options = '/vehicle-options';

async function list<T>(endpoint: string, signal: AbortSignal) {
  const items: T[] = [];
  for (let page = 0; ; page += 1) {
    const { data } = await axiosClient.get<{ data: VehiclePage<T> }>(endpoint, {
      signal, params: { page, size: 100 },
    });
    items.push(...data.data.content);
    if (page + 1 >= data.data.total_pages) return items;
  }
}

export const vehicleService = {
  list: (signal: AbortSignal) => list<UserVehicle>(vehicles, signal),
  async detail(id: string, signal: AbortSignal) {
    return (await axiosClient.get<{ data: UserVehicle }>(`${vehicles}/${id}`, { signal })).data.data;
  },
  options: (signal: AbortSignal) => list<VehicleOption>(options, signal),
  async save(optionId: string, name: string, id?: string) {
    const body = vehicleSchema.parse({ vehicle_info_id: optionId, name });
    if (id) await axiosClient.put(`${vehicles}/${id}`, body);
    else await axiosClient.post(vehicles, body);
  },
  async remove(id: string) {
    await axiosClient.delete(`${vehicles}/${id}`);
  },
};
