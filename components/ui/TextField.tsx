import type { InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
  multiline?: boolean;
}

const baseField =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10";

export function TextField({ label, hint, error, multiline, id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name;
  return (
    <label htmlFor={fieldId} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {multiline ? (
        <textarea
          id={fieldId}
          rows={3}
          className={`${baseField} resize-none${error ? " border-danger focus:border-danger focus:ring-danger/10" : ""}`}
          {...(props as InputHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          className={`${baseField}${error ? " border-danger focus:border-danger focus:ring-danger/10" : ""}`}
          {...props}
        />
      )}
      {error && <span className="text-xs text-danger">{error}</span>}
      {hint && !error && <span className="text-xs text-subtle">{hint}</span>}
    </label>
  );
}
