import { redirect } from "next/navigation";

import { NorthStarForm } from "@/components/north-star-form";
import { saveNorthStar } from "@/lib/actions/north-star";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// First-run only. A user who already has a North Star has nothing to
// onboard into — send them straight to the product.
export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("north_stars")
    .select("id")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) redirect("/app");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          What are you building?
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          This brief is what Synergy generates your first ticket queue from.
        </p>
      </div>
      <NorthStarForm action={saveNorthStar} submitLabel="Save & continue" />
    </main>
  );
}
