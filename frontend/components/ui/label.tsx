import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-xs font-semibold text-clinic-ink select-none flex items-center gap-1",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {required && <span className="text-clinic-terracotta font-bold">*</span>}
    </label>
  )
);
Label.displayName = "Label";

export { Label };
