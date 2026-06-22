import type { InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  multiline?: boolean;
}

const baseField =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base text-foreground outline-none transition-all placeholder:text-subtle/50 focus:border-brand focus:ring-4 focus:ring-brand/10";

export function TextField({ label, hint, multiline, id, ...props }: TextFieldProps) {
  const fieldId = id ?? props.name;
  return (
    <label htmlFor={fieldId} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {multiline ? (
        <textarea
          id={fieldId}
          rows={3}
          className={`${baseField} resize-none`}
          {...(props as InputHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input id={fieldId} className={baseField} {...props} />
      )}
      {hint && <span className="text-xs text-subtle">{hint}</span>}
    </label>
  );
}
