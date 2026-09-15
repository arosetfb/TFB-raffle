import type { Config } from "@netlify/functions";
import { randomInt } from "node:crypto";
import { listEntries, getWinners, metaStore, checkPasscode, jsonResponse, type Winners } from "../../shared/raffle.ts";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }
  if (!checkPasscode(req)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const entries = await listEntries();
  let winners = await getWinners();

  if (!winners || !winners.ids || !winners.ids.length) {
    const idx = entries.map((_e, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      const tmp = idx[i];
      idx[i] = idx[j];
      idx[j] = tmp;
    }
    const winnerIds = idx.slice(0, Math.min(2, idx.length)).map((i) => entries[i].id);
    winners = { ids: winnerIds, drawnAt: new Date().toISOString() } as Winners;
    await metaStore().setJSON("winners", winners);
  }

  return jsonResponse({ entries, winners });
};

export const config: Config = {
  path: "/.netlify/functions/draw",
};
