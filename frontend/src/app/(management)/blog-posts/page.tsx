import { BlogPage } from "@/components/features/blog/blog-page";
import { requireWebSession } from "@/lib/server/require-web-session";

export default async function Page() {
  return <BlogPage user={await requireWebSession()} />;
}
