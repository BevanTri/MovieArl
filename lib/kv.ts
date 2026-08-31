// ponytail: Upstash REST via fetch, no SDK
const URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

export const kvEnabled = Boolean(URL && TOKEN);

function hdr() {
  return { Authorization: `Bearer ${TOKEN}` };
}

export async function kvGet(key: string): Promise<string | null> {
  if (!kvEnabled) return null;
  const r = await fetch(`${URL}/get/${encodeURIComponent(key)}`, { headers: hdr(), cache: "no-store" });
  if (!r.ok) return null;
  const j = (await r.json()) as { result?: string | null };
  return j.result ?? null;
}

export async function kvSet(key: string, val: string) {
  if (!kvEnabled) return;
  // Upstash set via POST /set/key/value
  await fetch(`${URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(val)}`, {
    method: "POST",
    headers: hdr(),
    cache: "no-store",
  });
}
