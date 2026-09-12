import { Skel, SkeletonRegion } from "@/components/skeleton";
import { northStarFields } from "@/lib/north-star";

/**
 * The North Star brief while its route resolves — shared by `/onboarding` and
 * `/app/north-star`.
 *
 * The field list comes from `northStarFields`, so the skeleton has exactly as
 * many groups as the form and they arrive in the same order. Each group is a
 * label bar, a hint bar and a control at the real control's height: 44px for
 * the single-line `product_name`, 88px for the six textareas (`.textarea`'s
 * min-height). That is what keeps the page from jumping when the form lands.
 *
 * The label and hint are skeletoned along with the control even though their
 * text is static. On `/app/north-star` the values are what we are waiting for,
 * and a form that is half-real, half-blank while it fills in reads as broken
 * rather than as loading.
 */
export function FormSkeleton() {
  return (
    <SkeletonRegion
      label="Loading your brief"
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: 28,
      }}
    >
      {northStarFields.map((field) => (
        <div
          key={field.name}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <Skel w={`${Math.min(field.label.length * 8 + 16, 160)}px`} h={10} />
          <Skel w={`${Math.min(field.hint.length * 5 + 24, 340)}px`} h={9} />
          <Skel
            shape="block"
            w="100%"
            h={field.multiline ? 88 : 44}
            style={{ marginTop: 2 }}
          />
        </div>
      ))}
      <Skel w={148} h={38} />
    </SkeletonRegion>
  );
}
