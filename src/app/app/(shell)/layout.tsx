import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * The queue shell — `/app` and `/app/queue`.
 *
 * A route group rather than `app/layout.tsx` because design.md §4 gives the
 * North Star brief a different shell (bloom, borderless wordmark header, no
 * rail), and it lives at `/app/north-star`. The group keeps the URLs.
 *
 * It owns two things every view in it needs and nothing else:
 *
 * - the `.app` class, which is where globals.css scopes the design tokens;
 * - the header, fetched here rather than per-page so it is already resolved
 *   when a page suspends. That is what lets `loading.tsx` and `error.tsx` show
 *   a real header above a skeleton or a failure instead of a blank frame.
 *
 * The rail is deliberately not here: it is a view of the tickets, and both the
 * loading and the failed-read states need to render it differently.
 */
export default async function QueueShellLayout({
  children,
}: LayoutProps<"/app">) {
  const supabase = await createServerSupabaseClient();

  const { data: northStar } = await supabase
    .from("north_stars")
    .select("product_name, version")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!northStar) redirect("/onboarding");

  return (
    <div
      className="app"
      style={{
        // A definite height, not `flex: 1`. design.md §4 is a fixed frame:
        // the header is pinned and the rail and main pane scroll inside it.
        // Against the root layout's `min-h-full` body, `flex: 1` resolves to
        // the content's own height and the rail's footer leaves the viewport.
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppHeader
        productName={northStar.product_name}
        version={northStar.version}
        showUser
      />
      {children}
    </div>
  );
}
