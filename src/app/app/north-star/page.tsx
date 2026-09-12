import { redirect } from "next/navigation";

import { FormShell } from "@/components/form-shell";
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
    <FormShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1
          className="display"
          style={{ fontSize: 32, lineHeight: 1.15, margin: 0 }}
        >
          Edit your North Star
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            margin: 0,
            textWrap: "pretty",
          }}
        >
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
    </FormShell>
  );
}
