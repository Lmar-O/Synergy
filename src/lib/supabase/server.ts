import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database, TablesInsert } from "./types";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * Every request carries the caller's Clerk session token. That token is the
 * only reason `auth.jwt() ->> 'sub'` resolves inside the RLS policies — with no
 * token there is no `sub`, and every policy denies. The failure is silent and
 * total, so if a signed-in user's queries come back empty, suspect the token
 * before suspecting the query.
 *
 * Two things have to be true on the provider side for this to work at all:
 *   1. Clerk is registered as a Third-Party Auth provider in Supabase.
 *   2. The Clerk -> Supabase integration is on, so session tokens carry
 *      `"role": "authenticated"`. Without it Supabase never assumes the
 *      `authenticated` Postgres role and the policies are never evaluated.
 *
 * This is Supabase's native Third-Party Auth path. Do NOT reach for the legacy
 * `getToken({ template: "supabase" })` JWT template — it is deprecated, and
 * Clerk's own TSDoc still shows it.
 *
 * A new client per request is intended: `accessToken` is called per request and
 * may be called repeatedly, and Clerk's `getToken()` caches the token itself.
 */
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Checked here rather than at module scope so a missing env var fails the
  // request that needs it, not the build.
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.example.",
    );
  }

  const { getToken } = await auth();

  return createClient<Database>(url, key, {
    accessToken: async () => await getToken(),
  });
}

/**
 * A `profiles` row must exist before any `north_stars` insert — there's an FK.
 * Nothing creates one on Clerk sign-up yet (that's a `user.created` webhook,
 * still open), so every write path that might be a user's first upserts its
 * own profile first. The upsert is idempotent, so calling this on every save
 * (not just the first) is harmless.
 */
export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    `${userId}@unknown.local`;

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, email }, { onConflict: "id" });

  if (error) {
    throw new Error(`profiles.upsert: ${error.message}`);
  }
}

/**
 * `north_stars.version` and `tickets.number` are NOT NULL with no DEFAULT, so
 * the generated Insert types demand them. In the database both are assigned per
 * user by a BEFORE INSERT trigger when omitted — the type generator reads
 * columns, not triggers.
 *
 * Callers should omit both and let the database sequence them. Pass the payload
 * through `asNorthStarInsert` / `asTicketInsert` at the `.insert()` call to
 * reconcile that with the generated types.
 */
export type NorthStarInsert = Omit<TablesInsert<"north_stars">, "version"> & {
  version?: number;
};

export type TicketInsert = Omit<TablesInsert<"tickets">, "number"> & {
  number?: number;
};

export const asNorthStarInsert = (row: NorthStarInsert) =>
  row as TablesInsert<"north_stars">;

export const asTicketInsert = (row: TicketInsert) =>
  row as TablesInsert<"tickets">;
