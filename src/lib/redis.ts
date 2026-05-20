import { Redis } from "@upstash/redis";

const redisUrl =
  process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_KV_URL ||
  process.env.UPSTASH_REDIS_REST_REDIS_URL ||
  process.env.UPSTASH_REDIS_REST_URL;

const redisToken =
  process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_KV_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | undefined;

export function getRedis() {
  if (!redisUrl || !redisToken) {
    return undefined;
  }

  redis ??= new Redis({
    url: redisUrl,
    token: redisToken,
  });

  return redis;
}

export function assertRedis() {
  const client = getRedis();

  if (!client) {
    throw new Error(
      "Redis 未配置，请在 Vercel 环境变量中设置 Upstash Redis REST URL 和 Token。",
    );
  }

  return client;
}

export function parseRedisJson<T>(value: unknown): T | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  return value as T;
}
