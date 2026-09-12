import { FormShell } from "@/components/form-shell";
import { FormSkeleton } from "@/components/form-skeleton";

/**
 * `/app/north-star` while the current brief loads. Unlike `/onboarding`, the
 * values here are what we are waiting for, which is why the skeleton covers
 * the labels too — see FormSkeleton.
 */
export default function NorthStarLoading() {
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
          North stars are append-only — saving creates a new version rather than
          overwriting the current one.
        </p>
      </div>
      <FormSkeleton />
    </FormShell>
  );
}
