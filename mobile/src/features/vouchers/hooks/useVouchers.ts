import { useEffect, useRef, useState } from 'react';
import { ApiError, authErrorMessage } from '@/src/lib/api/apiError';
import { VOUCHER_COPY as copy } from '../constants';
import { voucherService } from '../services/voucherService';
import type { VoucherRows, VoucherView, WalletVoucher } from '../types/voucher';

export function useVouchers() {
  const [view, setView] = useState<VoucherView>('available');
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; rows?: VoucherRows; total?: number }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [qr, setQr] = useState<{ voucher: WalletVoucher; autoSave: boolean }>();
  const pending = useRef(false);
  const key = `${view}/${page}/${revision}`;
  const current = result?.key === key ? result : undefined;

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function load() {
      try {
        if (view === 'available') {
          const data = await voucherService.available(page, signal);
          if (!signal.aborted) setResult({ key, rows: { view, items: data.content }, total: data.total_pages });
        } else {
          const data = await voucherService.wallet(view, page, signal);
          if (!signal.aborted) setResult({ key, rows: { view, items: data.content }, total: data.total_pages });
        }
      } catch {
        if (!signal.aborted) setResult({ key });
      }
    }
    void load();
    return () => controller.abort();
  }, [key, page, view]);

  function select(next: VoucherView) {
    setView(next);
    setPage(0);
    setError(undefined);
    setMessage(undefined);
  }

  function refresh() {
    setPage(0);
    setRevision((value) => value + 1);
  }

  async function mutate(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      await action();
      refresh();
    } catch (cause) {
      if (cause instanceof ApiError) {
        if (cause.code === 'error.voucher-expired') {
          select('EXPIRED');
          setError(copy.expired);
          refresh();
        } else if (cause.code === 'error.voucher-already-claimed' || cause.code === 'error.voucher-unavailable') {
          setError(cause.code === 'error.voucher-already-claimed' ? copy.claimed : copy.soldOut);
          refresh();
        } else setError(authErrorMessage(cause));
      } else setError(copy.failed);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return {
    view, select, page, setPage, refresh, busy, error, message, qr,
    loading: !current, failed: !!current && !current.rows, rows: current?.rows, total: current?.total ?? 0,
    claim: (id: string) => mutate(async () => { await voucherService.claim(id); setMessage(copy.claimedNotice); }),
    issueQr: (id: string) => mutate(async () => {
      const voucher = await voucherService.downloadQr(id);
      select('USED');
      setQr({ voucher, autoSave: true });
    }),
    showQr: (voucher: WalletVoucher) => setQr({ voucher, autoSave: false }),
    closeQr: () => setQr(undefined),
  };
}
