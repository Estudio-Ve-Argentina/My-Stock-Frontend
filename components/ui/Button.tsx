import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "soft" | "accent" | "outline" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-brand-dark",
  soft: "bg-brand-soft text-brand-dark hover:bg-brand-soft/70",
  accent: "bg-accent text-white shadow-sm shadow-accent/20 hover:brightness-105",
  outline: "border border-border bg-surface text-foreground hover:bg-muted",
  ghost: "text-subtle hover:bg-muted hover:text-foreground",
  danger: "bg-danger text-white shadow-sm shadow-danger/20 hover:bg-danger/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-6 text-sm",
  sm: "h-9 px-4 text-sm",
};

function classesFor(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className: string,
): string {
  return [
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

interface LinkButtonProps extends CommonProps {
  href: string;
  external?: boolean;
}

export function LinkButton({
  href,
  external = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
}: LinkButtonProps) {
  const classes = classesFor(variant, size, fullWidth, className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className = "",
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={classesFor(variant, size, fullWidth, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
