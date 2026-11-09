import { useState } from "react";
import type { FormEvent } from "react";

export interface LeadForm {
  name: string;
  contact: string;
  company: string;
}

const EMPTY: LeadForm = { name: "", contact: "", company: "" };

const messageOf = (error: unknown): string =>
  error instanceof Error ? error.message : "Не удалось отправить заявку";

const sendLead = (form: LeadForm): Promise<void> =>
  fetch("/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(form),
  }).then((response) =>
    response.ok
      ? undefined
      : response.json().then((data) => {
          const message = typeof data === "object" && data !== null && "error" in data ? String(data.error) : "Ошибка";

          return Promise.reject(new Error(message));
        }),
  );

export const useLeadForm = () => {
  const [form, setForm] = useState<LeadForm>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  return {
    form,
    status,
    error,
    patch: (changes: Partial<LeadForm>) => setForm((previous) => ({ ...previous, ...changes })),
    submit: (event: FormEvent) => {
      event.preventDefault();

      sendLead(form).then(
        () => {
          setStatus("sent");
          setForm(EMPTY);
        },
        (cause: unknown) => {
          setStatus("error");
          setError(messageOf(cause));
        },
      );
    },
  };
};
