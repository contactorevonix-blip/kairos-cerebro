import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-2xl transition-kairos focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 shadow-glow-sm",
        secondary:
          "bg-white/5 hover:bg-white/10 text-gray-12 border border-white/10",
        ghost:
          "text-gray-11 hover:text-gray-12 hover:bg-white/5 border border-transparent",
        outline:
          "text-gray-12 border border-white/10 hover:border-white/20 hover:bg-white/4",
        destructive:
          "bg-red-600/90 hover:bg-red-600 text-white border border-red-500/30",
        link:
          "text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline p-0 h-auto",
        glass:
          "glass text-gray-12 hover:border-white/20",
      },
      size: {
        xs: "h-7 px-3 text-xs rounded-xl",
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
