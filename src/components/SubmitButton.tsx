"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { button } from "@/components/ui";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  formAction,
  formNoValidate,
  className = "w-full",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "quiet" | "onDeep";
  formAction?: (fd: FormData) => void | Promise<void>;
  formNoValidate?: boolean;
  className?: string;
}) {
  const { pending, action } = useFormStatus();
  const mine = pending && (!formAction || action === formAction);
  return (
    <button
      type="submit"
      formAction={formAction}
      formNoValidate={formNoValidate}
      disabled={pending}
      className={`${button(variant, "lg")} ${className}`}
    >
      {mine ? (
        <>
          <Loader2 size={18} className="animate-spin" /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
