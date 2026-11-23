import { useEffect, useRef, useState } from 'react';
import { ApiError, authErrorMessage } from '@/src/lib/api/apiError';
import { VEHICLE_COPY as copy } from '../constants';
import { vehicleService } from '../services/vehicleService';
import type { UserVehicle, VehicleOption } from '../types/vehicles';

export function useVehicles(detailId?: string) {
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mutating = useRef(false);
  const [result, setResult] = useState<{
    revision: number;
    data?: { vehicles: UserVehicle[]; options: VehicleOption[] };
    failed?: boolean;
  }>();
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    Promise.all([vehicleService.list(signal), vehicleService.options(signal)]).then(
      ([vehicles, options]) => {
        if (!signal.aborted) setResult({ revision, data: { vehicles, options } });
      },
      () => {
        if (!signal.aborted) setResult({ revision, failed: true });
      },
    );
    return () => controller.abort();
  }, [revision]);
  const [detail, setDetail] = useState<{ id: string; vehicle?: UserVehicle; failed?: boolean }>();
  useEffect(() => {
    if (!detailId) return;
    const controller = new AbortController();
    vehicleService.detail(detailId, controller.signal).then(
      (vehicle) => {
        if (!controller.signal.aborted) setDetail({ id: detailId, vehicle });
      },
      () => {
        if (!controller.signal.aborted) setDetail({ id: detailId, failed: true });
      },
    );
    return () => controller.abort();
  }, [detailId, revision]);

  async function submit(action: () => Promise<void>) {
    if (mutating.current) return;
    mutating.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
      setRevision((value) => value + 1);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 404) setError(copy.notFound);
      else if (cause instanceof ApiError && cause.status === 403) setError(copy.forbidden);
      else if (cause instanceof ApiError) setError(authErrorMessage(cause));
      else setError(copy.saveError);
    } finally {
      mutating.current = false;
      setBusy(false);
    }
  }

  const current = result?.revision === revision ? result : undefined;
  return {
    ...current,
    loading: !current,
    busy,
    error,
    submit,
    detail: detail?.id === detailId ? detail : undefined,
    reload: () => setRevision((value) => value + 1),
    save: vehicleService.save,
    remove: vehicleService.remove,
  };
}
