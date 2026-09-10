import { z } from "zod";

/**
 * Doubles as the OpenAI `response_format` schema (via `zodResponseFormat`)
 * and the runtime guard on what comes back. One schema, not two.
 *
 * `ref` is a model-invented short label ("1", "2", ...) scoped to this
 * generation only — it exists so `depends_on` can point at sibling tickets
 * before any of them have a real database id. The server action swaps refs
 * for generated uuids before insert.
 */
const ticketSchema = z.object({
  ref: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  acceptance_criteria: z.array(z.string().min(1)).min(1).max(6),
  estimate_hours: z.number().min(2).max(4),
  priority: z.number().int().min(1).max(5),
  depends_on: z.array(z.string()),
});

export const ticketGenerationSchema = z
  .object({
    tickets: z.array(ticketSchema).min(1).max(10),
  })
  .superRefine((data, ctx) => {
    const refs = new Set(data.tickets.map((t) => t.ref));
    if (refs.size !== data.tickets.length) {
      ctx.addIssue({ code: "custom", message: "Ticket refs must be unique." });
      return;
    }

    for (const ticket of data.tickets) {
      for (const dep of ticket.depends_on) {
        if (dep === ticket.ref) {
          ctx.addIssue({
            code: "custom",
            message: `Ticket ${ticket.ref} depends on itself.`,
          });
          return;
        }
        if (!refs.has(dep)) {
          ctx.addIssue({
            code: "custom",
            message: `Ticket ${ticket.ref} depends on unknown ref "${dep}".`,
          });
          return;
        }
      }
    }

    // DFS cycle check over the depends_on graph.
    const graph = new Map(data.tickets.map((t) => [t.ref, t.depends_on]));
    const state = new Map<string, "visiting" | "done">();

    const hasCycle = (ref: string): boolean => {
      state.set(ref, "visiting");
      for (const dep of graph.get(ref) ?? []) {
        const depState = state.get(dep);
        if (depState === "visiting") return true;
        if (!depState && hasCycle(dep)) return true;
      }
      state.set(ref, "done");
      return false;
    };

    for (const ref of graph.keys()) {
      if (!state.has(ref) && hasCycle(ref)) {
        ctx.addIssue({
          code: "custom",
          message: "Ticket dependencies contain a cycle.",
        });
        return;
      }
    }
  });

export type TicketGeneration = z.infer<typeof ticketGenerationSchema>;
export type GeneratedTicket = TicketGeneration["tickets"][number];
