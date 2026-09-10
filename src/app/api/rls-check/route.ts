import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  asNorthStarInsert,
  asTicketInsert,
  createServerSupabaseClient,
  ensureProfile,
} from "@/lib/supabase/server";

/**
 * Development-only proof that the Clerk -> Supabase -> RLS chain actually
 * holds, end to end, with real session tokens.
 *
 * The plan calls this out as the test most likely to fail quietly with text
 * IDs. The SQL suite in supabase/tests/rls_isolation.sql proves the policies
 * are right by impersonating users inside Postgres; it cannot prove that a real
 * Clerk token delivers `sub` and `role` to Supabase. Only this can.
 *
 *   POST /api/rls-check   seed a profile, a North Star, and two tickets for
 *                         the signed-in user
 *   GET  /api/rls-check   report everything this user can see
 *
 * To verify: sign in as user A, POST then GET. Sign in as user B, POST then
 * GET. Each response must show `isolationHolds: true` and only that user's
 * rows. If A can see B's rows, RLS is not doing its job.
 *
 * The reads below are deliberately UNFILTERED — no `.eq("user_id", ...)`
 * anywhere. Whatever comes back is exactly what RLS permits, which is the whole
 * point. Adding a filter would make this test pass for the wrong reason.
 */

const notInProduction = () =>
  process.env.NODE_ENV === "production"
    ? NextResponse.json({ error: "Not found" }, { status: 404 })
    : null;

export async function GET() {
  const blocked = notInProduction();
  if (blocked) return blocked;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();

  // What does Postgres think the caller's Clerk ID is? This is the single most
  // diagnostic value here: null means the token never arrived, or arrived
  // without a `sub`, and every policy is denying for that reason alone.
  const seenByPostgres = await supabase.rpc("clerk_user_id");

  const [profiles, northStars, tickets] = await Promise.all([
    supabase.from("profiles").select("id, email"),
    supabase.from("north_stars").select("id, user_id, product_name, version"),
    supabase.from("tickets").select("id, user_id, number, title, status"),
  ]);

  const errors = [
    seenByPostgres.error && `clerk_user_id(): ${seenByPostgres.error.message}`,
    profiles.error && `profiles: ${profiles.error.message}`,
    northStars.error && `north_stars: ${northStars.error.message}`,
    tickets.error && `tickets: ${tickets.error.message}`,
  ].filter(Boolean);

  const foreignRows = [
    ...(profiles.data ?? []).filter((row) => row.id !== userId),
    ...(northStars.data ?? []).filter((row) => row.user_id !== userId),
    ...(tickets.data ?? []).filter((row) => row.user_id !== userId),
  ];

  return NextResponse.json({
    clerkUserId: userId,
    clerkUserIdSeenByPostgres: seenByPostgres.data ?? null,
    tokenReachedPostgres: seenByPostgres.data === userId,
    isolationHolds: foreignRows.length === 0,
    foreignRows,
    visible: {
      profiles: profiles.data ?? [],
      northStars: northStars.data ?? [],
      tickets: tickets.data ?? [],
    },
    errors,
  });
}

export async function POST() {
  const blocked = notInProduction();
  if (blocked) return blocked;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();

  try {
    await ensureProfile(supabase, userId);
  } catch (error) {
    return NextResponse.json(
      {
        step: "profiles.upsert",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }

  // `version` omitted on purpose — the trigger assigns it per user.
  const northStar = await supabase
    .from("north_stars")
    .insert(
      asNorthStarInsert({
        user_id: userId,
        product_name: `RLS check for ${userId.slice(0, 12)}`,
        core_problem: "Confirming Clerk text IDs survive the trip into RLS.",
        tech_stack: "Next.js 16, Clerk, Supabase",
        current_milestone: "Verify isolation before building on the schema",
        success_criteria: "Each user sees only their own rows.",
      }),
    )
    .select()
    .single();

  if (northStar.error) {
    return NextResponse.json(
      { step: "north_stars.insert", error: northStar.error.message },
      { status: 500 },
    );
  }

  // `number` omitted on purpose — same trigger pattern, sequenced per user.
  //
  // Every object in a bulk insert MUST carry an identical set of keys. PostgREST
  // builds one INSERT from the union of the keys it sees, and any object missing
  // one of them sends NULL for it rather than falling back to the column
  // DEFAULT. Omitting `position` on just one row is enough to trip its NOT NULL
  // constraint. This bites the step-5 generator hardest, which bulk-inserts a
  // whole queue at once — keep the shapes uniform there too.
  const tickets = await supabase
    .from("tickets")
    .insert([
      asTicketInsert({
        user_id: userId,
        north_star_id: northStar.data.id,
        title: "First ticket",
        estimate_hours: 3,
        position: 0,
        acceptance_criteria: ["Visible to its owner", "Invisible to everyone else"],
      }),
      asTicketInsert({
        user_id: userId,
        north_star_id: northStar.data.id,
        title: "Second ticket",
        estimate_hours: 2,
        position: 1,
        acceptance_criteria: ["Sequenced after the first"],
      }),
    ])
    .select("id, number, title, position");

  if (tickets.error) {
    return NextResponse.json(
      { step: "tickets.insert", error: tickets.error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    seeded: true,
    clerkUserId: userId,
    northStar: { id: northStar.data.id, version: northStar.data.version },
    tickets: tickets.data,
  });
}
