type Bucket = {
  characters: number;
  requests: number;
  resetAt: number;
};

type LimitOptions = {
  namespace: string;
  characters?: number;
  requests?: number;
  maxCharacters?: number;
  maxRequests?: number;
  windowMs?: number;
};

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
  remainingCharacters: number;
};

export function rateLimit(ip: string, options: LimitOptions): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const maxCharacters = options.maxCharacters ?? 120_000;
  const maxRequests = options.maxRequests ?? 80;
  const windowMs = options.windowMs ?? 10 * 60_000;

  const key = `${options.namespace}:${ip}`;
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { characters: 0, requests: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  const characters = options.characters ?? 0;
  const requests = options.requests ?? 1;

  if (bucket.characters + characters > maxCharacters || bucket.requests + requests > maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      remainingCharacters: Math.max(0, maxCharacters - bucket.characters),
    };
  }

  bucket.characters += characters;
  bucket.requests += requests;

  return {
    allowed: true,
    retryAfter: 0,
    remainingCharacters: Math.max(0, maxCharacters - bucket.characters),
  };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-real-ip") ?? "unknown";
}
