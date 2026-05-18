import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium transition-kairos",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-white/6 text-gray-11 border border-white/10 text-xs px-3 py-1",
        accent:
          "rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-3 py-1",
        success:
          "rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1",
        warning:
          "rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-3 py-1",
        danger:
          "rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs px-3 py-1",
        outline:
          "rounded-full border border-white/15 text-gray-11 text-xs px-3 py-1",
        dot:
          "rounded-full bg-white/6 text-gray-11 border border-white/10 text-xs px-2.5 py-1 before:content-[''] before:inline-block before:w-1.5 before:h-1.5 before:rounded-full before:bg-current",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: dotColor || "currentColor" }}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
