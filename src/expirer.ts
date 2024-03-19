import { RedisClientType } from "redis";
import { keyBlacklist, keyJwtExpire } from "./repositories/blacklist";

export async function expirer(redis: RedisClientType<any, any, any>) {
  while (1) {
    try {
      await expire(redis);
    } catch (err) {
      console.error(`got error: ${err}`);
      break;
    }

    // Every minute
    await new Promise((r) => setTimeout(r, 60 * 1000));
  }
}

async function expire(redis: RedisClientType<any, any, any>) {
  // Get all blacklisted tokens
  const blacklisteds = await redis.sMembers(keyBlacklist);
  const now = Date.now();

  blacklisteds.forEach(async (token) => {
    const expStr = await redis.hGet(keyJwtExpire, token);
    if (!expStr) {
      return;
    }

    const exp = Number(expStr) * 1000;
    if (isNaN(exp)) {
      console.error(`found non-number exp: ${expStr}`);
      return;
    }

    console.log({ now, token, exp });

    if (now >= exp) {
      console.log(`expiring ${token} at ${now}`);
      await Promise.all([redis.sRem(keyBlacklist, token), redis.hDel(keyJwtExpire, token)]);
      // await redis.sRem(keyBlacklist, token);
      // await redis.hDel(keyJwtExpire, token);
    }
  });
}
