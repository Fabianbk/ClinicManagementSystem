"use client";

import React, { createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface FormFieldContextValue {
  id?: string;
  error?: string | null;
  hasError: boolean;
  required?: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue>({
  hasError: false,
});

export function useFormField() {
  return useContext(FormFieldContext);
}

export interface FormFieldProps {
  id?: string;
  label?: React.ReactNode;
  required?: boolean;
  error?: string | null | false;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  const errorMessage = error ? String(error) : null;
  const hasError = Boolean(errorMessage);

  return (
    <FormFieldContext.Provider value={{ id, error: errorMessage, hasError, required }}>
      <div
        className={cn("space-y-1.5 w-full", hasError && "has-form-error", className)}
        data-has-error={hasError}
      >
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold text-clinic-ink-soft cursor-pointer select-none"
          >
            <span>{label}</span>
            {required && (
              <span className="text-clinic-danger ml-1 font-bold" title="จำเป็นต้องกรอก">
                *
              </span>
            )}
          </label>
        )}

        {/* Child Input Element: if a single React element, pass error/id props if not already set */}
        <div className="relative">
          {React.isValidElement(children)
            ? React.cloneElement(children as React.ReactElement<any>, {
                id: children.props.id || id,
                error: children.props.error !== undefined ? children.props.error : hasError,
                "aria-invalid": hasError,
              })
            : children}
        </div>

        {/* Error message */}
        {hasError ? (
          <p
            id={id ? `${id}-error` : undefined}
            className="text-xs text-clinic-danger font-medium flex items-center gap-1 mt-1 transition-all duration-150 animate-in fade-in slide-in-from-top-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        ) : hint ? (
          <p className="text-[11px] text-clinic-ink-muted mt-1">{hint}</p>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
}
