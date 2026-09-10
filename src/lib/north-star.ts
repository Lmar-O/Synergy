import { z } from "zod";

export const northStarSchema = z.object({
  product_name: z.string().trim().min(1, "Tell us what you're building."),
  core_problem: z.string().trim().min(1, "What problem does this solve?"),
  tech_stack: z.string().trim().min(1, "What are you building it with?"),
  current_milestone: z.string().trim().min(1, "What's the next milestone?"),
  success_criteria: z
    .string()
    .trim()
    .min(1, "How will you know it's working?"),
  constraints: z.string().trim().default(""),
  out_of_scope: z.string().trim().default(""),
});

export type NorthStarFormValues = z.infer<typeof northStarSchema>;
export type NorthStarFieldName = keyof NorthStarFormValues;

export const northStarFields: {
  name: NorthStarFieldName;
  label: string;
  hint: string;
  placeholder: string;
  required: boolean;
  multiline: boolean;
}[] = [
  {
    name: "product_name",
    label: "Product name",
    hint: "What are you calling this?",
    placeholder: "Synergy",
    required: true,
    multiline: false,
  },
  {
    name: "core_problem",
    label: "Core problem",
    hint: "The problem this solves, in plain language.",
    placeholder:
      "Founders context-switch between a vague roadmap and a blank cursor.",
    required: true,
    multiline: true,
  },
  {
    name: "tech_stack",
    label: "Tech stack",
    hint: "What you're actually building with — frameworks, language, hosting.",
    placeholder: "Next.js, TypeScript, Supabase, Clerk",
    required: true,
    multiline: true,
  },
  {
    name: "current_milestone",
    label: "Current milestone",
    hint: "What does done look like for what you're working on right now?",
    placeholder: "Ship the North Star form and its persistence.",
    required: true,
    multiline: true,
  },
  {
    name: "success_criteria",
    label: "Success criteria",
    hint: "How you'll know this milestone actually worked.",
    placeholder: "A founder can submit a brief and see it saved on reload.",
    required: true,
    multiline: true,
  },
  {
    name: "constraints",
    label: "Constraints",
    hint: "Anything real work has to respect.",
    placeholder: "Solo founder, a few hours a week, no budget for a designer.",
    required: false,
    multiline: true,
  },
  {
    name: "out_of_scope",
    label: "Out of scope",
    hint: "What you're deliberately not doing yet.",
    placeholder: "Teams, billing, mobile app.",
    required: false,
    multiline: true,
  },
];
