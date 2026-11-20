import axiosClient from "@/lib/axios-client";
import { getBrands } from "./brand-service";

export function clearManagementSession() {
  delete axiosClient.defaults.headers.common.Authorization;
}

export async function startManagementSession(
  username: string,
  password: string,
) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  axiosClient.defaults.headers.common.Authorization = `Basic ${btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))}`;
  try {
    await getBrands();
  } catch (error) {
    clearManagementSession();
    throw error;
  }
}
