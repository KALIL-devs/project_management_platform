import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function Input({
  label,
  error,
  helperText,
  type = "text",
  className = "",
  id,
  required,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`w-full border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/50 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all duration-150 ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}