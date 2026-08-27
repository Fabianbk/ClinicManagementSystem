import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-control border bg-white px-3.5 py-2 text-sm text-clinic-ink placeholder:text-clinic-ink-muted/70 transition-all",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clinic-primary focus-visible:border-clinic-primary",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-clinic-bg/60",
          error
            ? "border-clinic-danger focus-visible:ring-clinic-danger text-clinic-danger"
            : "border-clinic-line hover:border-clinic-line-dark",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
