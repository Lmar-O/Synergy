"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type TicketActionState = { message?: string };

/**
 * Both transitions below filter on `status in (queued, active)` as well as the
 * id. Server Actions are reachable by direct POST, and a second tab can move
 * the same ticket first, so the guard lives in the WHERE clause: a stale or
 * forged submission updates zero rows instead of re-completing a finished
 * ticket or reviving a blocked one. Ownership is already enforced by RLS —
 * `tickets: update own` — which is why neither statement filters on user_id.
 */
const OPEN_STATUSES = ["queued", "active"] as const;

export async function completeTicket(
  _prevState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const { userId } = await auth();
  if (!userId) return { message: "You need to be signed in." };

  const ticketId = String(formData.get("ticketId") ?? "");
  if (!ticketId) return { message: "Missing ticket id." };

  const supabase = await createServerSupabaseClient();

  // `completed_at` is not optional: the tickets_done_has_completed constraint
  // rejects a done row without one.
  const { data, error } = await supabase
    .from("tickets")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      blocked_reason: null,
    })
    .eq("id", ticketId)
    .in("status", OPEN_STATUSES)
    .select("id")
    .maybeSingle();

  if (error) return { message: `Could not complete it: ${error.message}` };
  if (!data) return { message: "That ticket already moved on." };

  refresh();
  return {};
}

export async function blockTicket(
  _prevState: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const { userId } = await auth();
  if (!userId) return { message: "You need to be signed in." };

  const ticketId = String(formData.get("ticketId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!ticketId) return { message: "Missing ticket id." };
  // tickets_blocked_has_reason enforces this in the database too. Checking here
  // keeps it a form error rather than a constraint violation — and the stored
  // reasons are the labelled corpus the Phase 2 re-sequencing prompt gets
  // designed against, so an empty one is worse than useless.
  if (!reason) return { message: "Say what's blocking it." };

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("tickets")
    .update({ status: "blocked", blocked_reason: reason, completed_at: null })
    .eq("id", ticketId)
    .in("status", OPEN_STATUSES)
    .select("id")
    .maybeSingle();

  if (error) return { message: `Could not block it: ${error.message}` };
  if (!data) return { message: "That ticket already moved on." };

  refresh();
  return {};
}
