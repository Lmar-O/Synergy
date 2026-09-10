"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { northStarSchema, type NorthStarFieldName } from "@/lib/north-star";
import {
  asNorthStarInsert,
  createServerSupabaseClient,
  ensureProfile,
} from "@/lib/supabase/server";

export type NorthStarFormState = {
  errors?: Partial<Record<NorthStarFieldName, string>>;
  message?: string;
};

/**
 * Shared by /onboarding (first save) and /app/north-star (every later save).
 * north_stars is append-only — this always inserts, never updates. `version`
 * is omitted so the per-user BEFORE INSERT trigger assigns the next one.
 */
export async function saveNorthStar(
  _prevState: NorthStarFormState,
  formData: FormData,
): Promise<NorthStarFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { message: "You need to be signed in." };
  }

  const parsed = northStarSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      errors: Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [
          field,
          messages?.[0],
        ]),
      ),
      message: "Fix the highlighted fields.",
    };
  }

  const supabase = await createServerSupabaseClient();

  try {
    await ensureProfile(supabase, userId);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "Could not save your brief.",
    };
  }

  const { error } = await supabase
    .from("north_stars")
    .insert(asNorthStarInsert({ user_id: userId, ...parsed.data }));

  if (error) {
    return { message: `Could not save: ${error.message}` };
  }

  redirect("/app");
}
