import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-control border bg-white px-3.5 py-2.5 text-sm text-clinic-ink placeholder:text-clinic-ink-muted/70 transition-all",
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
Textarea.displayName = "Textarea";

export { Textarea };
