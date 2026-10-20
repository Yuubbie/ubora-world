"use client";

import { useState } from "react";

type PasswordFieldProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
};

export default function PasswordField({
  id = "password",
  name = "password",
  value,
  onChange,
  label = "Password",
  autoComplete = "current-password",
  required = true,
  minLength,
  className = "mb-6",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className="w-full px-3.5 py-2.5 pr-16 rounded-lg border border-line text-sm"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-2 text-xs font-semibold text-muted hover:text-ink"
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
