"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
};

// La variante (buttonPrimary, buttonSecondary…) llega en className desde components/ui/styles.ts.
export function SubmitButton({ children, pendingLabel, className = "" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`inline-flex items-center justify-center disabled:cursor-wait ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
