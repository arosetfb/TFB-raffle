import type { Config } from "@netlify/functions";
import { entriesStore, emailsStore, jsonResponse, type Entry } from "../../shared/raffle.ts";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "bad_request" }, 400);
  }

  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const consent = !!body.consent;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const digits = phone.replace(/\D/g, "");
  if (!firstName || !lastName || !emailOk || digits.length < 10 || !consent) {
    return jsonResponse({ error: "invalid" }, 400);
  }

  const normalizedEmail = email.toLowerCase();
  const emails = emailsStore();
  const existing = await emails.get(normalizedEmail);
  if (existing) {
    return jsonResponse({ error: "duplicate" }, 409);
  }

  const id =
    typeof body.id === "string" && /^[A-Za-z0-9-]{6,80}$/.test(body.id)
      ? body.id
      : crypto.randomUUID();

  const entry: Entry = {
    id,
    firstName,
    lastName,
    email,
    phone,
    consent,
    enteredAt: new Date().toISOString(),
  };

  // Reserve the email first so two near-simultaneous submissions for the
  // same address can't both slip past the duplicate check.
  await emails.set(normalizedEmail, id);
  await entriesStore().setJSON(id, entry);

  return jsonResponse({ ok: true });
};

export const config: Config = {
  path: "/.netlify/functions/submit-entry",
};
