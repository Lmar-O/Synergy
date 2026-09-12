"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { AlertIcon, SpinnerIcon } from "@/components/app-icons";
import type { NorthStarFormState } from "@/lib/actions/north-star";
import { northStarFields, type NorthStarFormValues } from "@/lib/north-star";

const initialState: NorthStarFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-dark">
      {pending && <SpinnerIcon className="ico spin" />}
      {pending ? "Saving…" : label}
    </button>
  );
}

/**
 * The North Star brief. Restyled onto the design system (design.md §3) — the
 * `.textarea` recipe, `.btn-dark` for the primary action, the inline-error
 * recipe for validation. The data flow is unchanged.
 *
 * Control heights are load-bearing beyond looks: `form-skeleton.tsx` stands in
 * for this form at 44px for the single-line field and 88px for the textareas,
 * so the page does not jump when the real one arrives.
 */
export function NorthStarForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (
    state: NorthStarFormState,
    formData: FormData,
  ) => Promise<NorthStarFormState>;
  defaultValues?: Partial<NorthStarFormValues>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: 28,
      }}
    >
      {northStarFields.map((field) => {
        const error = state.errors?.[field.name];
        const shared = {
          id: field.name,
          name: field.name,
          required: field.required,
          defaultValue: defaultValues?.[field.name],
          placeholder: field.placeholder,
          "aria-invalid": Boolean(error),
          "aria-describedby": `${field.name}-hint`,
          className: field.multiline ? "textarea" : "textarea line",
        };

        return (
          <div
            key={field.name}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <label
              htmlFor={field.name}
              style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}
            >
              {field.label}
              {!field.required && (
                <span
                  style={{
                    marginLeft: 6,
                    fontWeight: 400,
                    color: "var(--text-light)",
                  }}
                >
                  (optional)
                </span>
              )}
            </label>
            <p
              id={`${field.name}-hint`}
              style={{
                margin: 0,
                fontSize: 12,
                color: "var(--text-muted)",
                textWrap: "pretty",
              }}
            >
              {field.hint}
            </p>
            {field.multiline ? (
              <textarea {...shared} rows={3} style={{ marginTop: 4 }} />
            ) : (
              <input {...shared} type="text" style={{ marginTop: 4 }} />
            )}
            {error && (
              <p className="inline-err" style={{ margin: "2px 0 0" }}>
                <AlertIcon />
                <span>{error}</span>
              </p>
            )}
          </div>
        );
      })}

      {state.message && (
        <p role="alert" className="inline-err" style={{ margin: 0 }}>
          <AlertIcon />
          <span>{state.message}</span>
        </p>
      )}

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
