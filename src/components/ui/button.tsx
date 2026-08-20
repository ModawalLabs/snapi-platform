import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Button.
 *
 * Variant naming follows the palette's intent, not its colour: `primary` is the
 * high-contrast ink action, `gold` is the one expressive/premium action per
 * view. If two gold buttons are visible at once, one of them is wrong.
 *
 * No `asChild` / Radix Slot: for links we render `<Link className={buttonVariants(…)}>`
 * instead, which keeps this a plain cheap component with no extra dependency.
 */
const buttonVariants = cva(
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md whitespace-nowrap",
    "font-medium transition-[background-color,color,border-color,box-shadow,scale] duration-150",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        primary: "bg-ink text-ink-content shadow-premium-sm hover:bg-ink-hover",
        gold: "bg-gold-solid text-gold-content shadow-premium-sm hover:bg-gold-solid-hover",
        secondary:
          "border border-border bg-surface text-content shadow-premium-sm hover:border-border-strong hover:bg-surface-raised",
        outline: "border border-border-strong text-content hover:bg-surface-raised",
        ghost: "text-content-muted hover:bg-surface-raised hover:text-content",
        danger: "bg-danger text-white shadow-premium-sm hover:opacity-90",
        link: "text-azure underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        // Square variants for icon-only buttons. Always pair with aria-label.
        "icon-sm": "size-8",
        icon: "size-10",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Shows a spinner and blocks interaction. Label is retained to avoid layout shift. */
  isLoading?: boolean;
  loadingLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, fullWidth, isLoading, loadingLabel, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { buttonVariants };
