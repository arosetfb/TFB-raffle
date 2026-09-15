import type { Config } from "@netlify/functions";
import { listEntries, metaStore, checkPasscode, jsonResponse } from "../../shared/raffle.ts";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }
  if (!checkPasscode(req)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  await metaStore().delete("winners");
  const entries = await listEntries();
  return jsonResponse({ entries, winners: null });
};

export const config: Config = {
  path: "/.netlify/functions/clear-winners",
};
