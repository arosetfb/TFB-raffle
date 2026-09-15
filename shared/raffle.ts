import { getStore } from "@netlify/blobs";

export interface Entry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consent: boolean;
  enteredAt: string;
}

export interface Winners {
  ids: string[];
  drawnAt: string;
}

export function entriesStore() {
  return getStore("raffle-entries");
}

export function emailsStore() {
  return getStore("raffle-emails");
}

export function metaStore() {
  return getStore("raffle-meta");
}

export async function listEntries(): Promise<Entry[]> {
  const store = entriesStore();
  const { blobs } = await store.list();
  const entries = await Promise.all(
    blobs.map((b) => store.get(b.key, { type: "json" }) as Promise<Entry | null>)
  );
  return entries.filter((e): e is Entry => !!e);
}

export async function getWinners(): Promise<Winners | null> {
  const store = metaStore();
  return (await store.get("winners", { type: "json" })) as Winners | null;
}

// Declares the ambient Netlify global injected into the function runtime.
declare const Netlify: { env: { get(key: string): string | undefined } };

export function checkPasscode(req: Request): boolean {
  const expected = Netlify.env.get("ADMIN_PASSCODE");
  if (!expected) return false;
  const header = req.headers.get("x-admin-passcode") || "";
  return header === expected;
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
