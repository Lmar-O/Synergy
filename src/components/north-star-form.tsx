"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { NorthStarFormState } from "@/lib/actions/north-star";
import { northStarFields, type NorthStarFormValues } from "@/lib/north-star";

const initialState: NorthStarFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

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
    <form action={formAction} className="flex flex-col gap-6">
      {northStarFields.map((field) => {
        const error = state.errors?.[field.name];
        const sharedProps = {
          id: field.name,
          name: field.name,
          required: field.required,
          defaultValue: defaultValues?.[field.name],
          placeholder: field.placeholder,
          "aria-invalid": Boolean(error),
          className:
            "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/30",
        };

        return (
          <div key={field.name} className="flex flex-col gap-1">
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {!field.required && (
                <span className="ml-1 font-normal text-black/50 dark:text-white/50">
                  (optional)
                </span>
              )}
            </label>
            <p className="text-xs text-black/60 dark:text-white/60">
              {field.hint}
            </p>
            {field.multiline ? (
              <textarea {...sharedProps} rows={3} />
            ) : (
              <input {...sharedProps} type="text" />
            )}
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        );
      })}
      {state.message && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
