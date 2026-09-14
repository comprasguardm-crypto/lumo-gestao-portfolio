import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lumo-turquoise focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-lumo-ink text-white hover:bg-lumo-ink/90",
        primary: "bg-lumo-turquoise text-lumo-ink hover:bg-lumo-turquoise/90",
        ai: "bg-lumo-ai text-white hover:bg-lumo-ai/90",
        outline: "border border-slate-200 bg-white text-lumo-ink hover:bg-slate-50",
        ghost: "text-lumo-ink hover:bg-slate-100",
        subtle: "bg-slate-100 text-lumo-ink hover:bg-slate-200",
        danger: "bg-red-50 text-red-600 hover:bg-red-100",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
