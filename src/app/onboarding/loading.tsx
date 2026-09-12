import { FormShell } from "@/components/form-shell";
import { FormSkeleton } from "@/components/form-skeleton";

/**
 * `/onboarding` while the server component decides whether there is already a
 * North Star to send you past.
 *
 * The heading is real: it is static copy, not data. Only the form is skeleton.
 */
export default function OnboardingLoading() {
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
      <FormSkeleton />
    </FormShell>
  );
}
