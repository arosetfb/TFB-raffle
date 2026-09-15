import type { Config } from "@netlify/functions";
import { entriesStore, emailsStore, metaStore, checkPasscode, jsonResponse } from "../../shared/raffle.ts";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }
  if (!checkPasscode(req)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const eStore = entriesStore();
  const mStore = emailsStore();

  const { blobs: entryBlobs } = await eStore.list();
  await Promise.all(entryBlobs.map((b) => eStore.delete(b.key)));

  const { blobs: emailBlobs } = await mStore.list();
  await Promise.all(emailBlobs.map((b) => mStore.delete(b.key)));

  await metaStore().delete("winners");

  return jsonResponse({ entries: [], winners: null });
};

export const config: Config = {
  path: "/.netlify/functions/clear-all",
};
