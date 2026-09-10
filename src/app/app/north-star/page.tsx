import { redirect } from "next/navigation";

import { NorthStarForm } from "@/components/north-star-form";
import { saveNorthStar } from "@/lib/actions/north-star";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NorthStarPage() {
  const supabase = await createServerSupabaseClient();
  const { data: current } = await supabase
    .from("north_stars")
    .select(
      "product_name, core_problem, tech_stack, current_milestone, constraints, out_of_scope, success_criteria, version",
    )
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!current) redirect("/onboarding");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit your North Star
        </h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          North stars are append-only — saving creates version{" "}
          {current.version + 1} rather than overwriting version{" "}
          {current.version}.
        </p>
      </div>
      <NorthStarForm
        action={saveNorthStar}
        defaultValues={current}
        submitLabel="Save new version"
      />
    </main>
  );
}
