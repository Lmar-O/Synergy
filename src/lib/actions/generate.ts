"use server";

import { randomUUID } from "node:crypto";

import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { ticketGenerationSchema, type GeneratedTicket } from "@/lib/tickets";
import {
  asTicketInsert,
  createServerSupabaseClient,
} from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

// Gemini's OpenAI-compatible endpoint. Same `openai` SDK, same
// zodResponseFormat/strict-schema plumbing a real OpenAI call would use —
// only the base URL, key, and model change. Google's free tier is what OpenAI
// lacks, and it's stable and documented, unlike OpenRouter's free-model
// lineup and per-model structured-output support, which both shift often.
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const SYSTEM_PROMPT = `You are a technical project planner. Given a founder's project brief, break their CURRENT MILESTONE into a queue of concrete engineering tickets that get it done.

Rules:
- Produce at most 10 tickets. Fewer, well-scoped tickets beat padding to 10.
- Each ticket is 2-4 hours of focused work for one person. Split anything bigger; merge anything smaller.
- Each ticket needs 1-6 concrete, testable acceptance criteria, not vague goals.
- Respect the stated tech stack and constraints. Do not propose work on anything in the out-of-scope list.
- Give each ticket a short "ref" you invent ("1", "2", ...) and a "depends_on" array of the refs of tickets that must finish first. A ticket with no prerequisites has an empty depends_on array. The dependency graph must have no cycles.
- priority is 1 (do first) to 5 (do last), independent of dependency order — use it to flag which unblocked ticket matters most.`;

function buildPrompt(northStar: Tables<"north_stars">) {
  return [
    `Product: ${northStar.product_name}`,
    `Core problem: ${northStar.core_problem}`,
    `Tech stack: ${northStar.tech_stack}`,
    `Current milestone: ${northStar.current_milestone}`,
    `Constraints: ${northStar.constraints || "none stated"}`,
    `Out of scope: ${northStar.out_of_scope || "none stated"}`,
    `Success criteria: ${northStar.success_criteria}`,
  ].join("\n");
}

export type GenerateTicketsState = {
  message?: string;
  tickets?: Pick<GeneratedTicket, "title" | "estimate_hours" | "priority">[];
};

/**
 * Reads the highest-version North Star, asks the model for a dependency-DAG
 * ticket queue, logs the raw response to `generations` (before validating —
 * a malformed generation should still be captured), then Zod-validates and
 * inserts the tickets.
 */
export async function generateTickets(
  _prevState: GenerateTicketsState,
  _formData: FormData,
): Promise<GenerateTicketsState> {
  const { userId } = await auth();
  if (!userId) {
    return { message: "You need to be signed in." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { message: "GEMINI_API_KEY is not set." };
  }

  const supabase = await createServerSupabaseClient();

  const { data: northStar, error: northStarError } = await supabase
    .from("north_stars")
    .select("*")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (northStarError || !northStar) {
    return { message: "Save a North Star before generating tickets." };
  }

  const openai = new OpenAI({ apiKey, baseURL: GEMINI_BASE_URL });

  let completion;
  try {
    completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(northStar) },
      ],
      response_format: zodResponseFormat(
        ticketGenerationSchema,
        "ticket_queue",
      ),
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? `Model request failed: ${error.message}`
          : "Model request failed.",
    };
  }

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return { message: "The model returned an empty response." };
  }

  const rawResponse = JSON.parse(content);

  const { error: logError } = await supabase.from("generations").insert({
    user_id: userId,
    north_star_id: northStar.id,
    model: completion.model,
    prompt_tokens: completion.usage?.prompt_tokens ?? null,
    completion_tokens: completion.usage?.completion_tokens ?? null,
    raw_response: rawResponse,
  });

  if (logError) {
    return { message: `Could not log generation: ${logError.message}` };
  }

  const parsed = ticketGenerationSchema.safeParse(rawResponse);
  if (!parsed.success) {
    return {
      message: `Model response didn't match the expected shape: ${parsed.error.issues[0]?.message ?? "unknown error"}`,
    };
  }

  const refToId = new Map(
    parsed.data.tickets.map((ticket) => [ticket.ref, randomUUID()]),
  );

  const ticketRows = parsed.data.tickets.map((ticket, index) =>
    asTicketInsert({
      id: refToId.get(ticket.ref),
      user_id: userId,
      north_star_id: northStar.id,
      title: ticket.title,
      body: ticket.body,
      estimate_hours: ticket.estimate_hours,
      priority: ticket.priority,
      tags: [],
      status: "queued",
      blocked_reason: null,
      position: index,
      acceptance_criteria: ticket.acceptance_criteria,
      // Every ref is validated against the ref set in ticketGenerationSchema,
      // so every lookup here is guaranteed to hit.
      depends_on: ticket.depends_on.map((ref) => refToId.get(ref)!),
      completed_at: null,
    }),
  );

  const { error: insertError } = await supabase
    .from("tickets")
    .insert(ticketRows);

  if (insertError) {
    return { message: `Could not save tickets: ${insertError.message}` };
  }

  return {
    message: `Generated ${ticketRows.length} ticket${ticketRows.length === 1 ? "" : "s"}.`,
    tickets: parsed.data.tickets.map((ticket) => ({
      title: ticket.title,
      estimate_hours: ticket.estimate_hours,
      priority: ticket.priority,
    })),
  };
}
