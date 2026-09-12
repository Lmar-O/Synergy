import { redirect } from "next/navigation";

import { FormShell } from "@/components/form-shell";
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
    <FormShell>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1
          className="display"
          style={{ fontSize: 32, lineHeight: 1.15, margin: 0 }}
        >
          What are you building?
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
          This brief is what Synergy generates your first ticket queue from.
        </p>
      </div>
      <NorthStarForm action={saveNorthStar} submitLabel="Save & continue" />
    </FormShell>
  );
}
