import type { Config } from "@netlify/functions";
import { listEntries, getWinners, checkPasscode, jsonResponse } from "../../shared/raffle.ts";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }
  if (!checkPasscode(req)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const [entries, winners] = await Promise.all([listEntries(), getWinners()]);
  return jsonResponse({ entries, winners });
};

export const config: Config = {
  path: "/.netlify/functions/get-state",
};
