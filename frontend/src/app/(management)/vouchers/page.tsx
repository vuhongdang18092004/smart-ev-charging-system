import { VoucherPage } from "@/components/features/vouchers/voucher-page";
import { requireWebSession } from "@/lib/server/require-web-session";

export default async function Page() {
  return <VoucherPage user={await requireWebSession()} />;
}
