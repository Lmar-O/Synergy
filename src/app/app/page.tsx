import Link from "next/link";
import { redirect } from "next/navigation";

import { GenerateTicketsButton } from "@/components/generate-tickets-button";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Placeholder until build-sequence step 6 replaces this with the real
// single-ticket view. For now it just proves the North Star round-trips.
export default async function AppPage() {
  const supabase = await createServerSupabaseClient();
  const { data: northStar } = await supabase
    .from("north_stars")
    .select("product_name, core_problem, current_milestone, version")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!northStar) redirect("/onboarding");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {northStar.product_name}
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          North Star v{northStar.version} — the ticket queue lands in a later
          step.
        </p>
      </div>
      <dl className="flex flex-col gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="font-medium">Core problem</dt>
          <dd className="text-black/70 dark:text-white/70">
            {northStar.core_problem}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="font-medium">Current milestone</dt>
          <dd className="text-black/70 dark:text-white/70">
            {northStar.current_milestone}
          </dd>
        </div>
      </dl>
      <Link
        href="/app/north-star"
        className="self-start text-sm underline underline-offset-4"
      >
        Edit brief
      </Link>
      <div className="flex flex-col gap-3 border-t border-black/10 pt-6 dark:border-white/15">
        <h2 className="text-sm font-medium">Ticket queue</h2>
        <GenerateTicketsButton />
      </div>
    </main>
  );
}
