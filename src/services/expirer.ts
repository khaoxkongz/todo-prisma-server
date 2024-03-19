import { RedisClientType } from "redis";
import { keyBlacklist, keyJwtExpire } from "../repositories";
import { formatDate } from ".";

export async function expirer(redis: RedisClientType<any, any, any>) {
  while (1) {
    try {
      await expire(redis);
    } catch (err) {
      console.error(`Error in expirer: ${err}`);
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

  // Use for...of loop with try/catch block
  for (const token of blacklisteds) {
    try {
      const expStr = await redis.hGet(keyJwtExpire, token);
      if (!expStr) {
        continue;
      }

      const exp = Number(expStr) * 1000;
      if (isNaN(exp)) {
        console.error(`Found non-number exp: ${expStr}`);
        continue;
      }

      if (now >= exp) {
        // Use Redis transaction for atomic operations
        const multi = redis.multi();
        multi.sRem(keyBlacklist, token);
        multi.hDel(keyJwtExpire, token);
        await multi.exec();

        console.log(`Expiring ${token} at ${formatDate(new Date(now))}`);
      }
    } catch (err) {
      console.error(`Error expiring token ${token}: ${err}`);
    }
  }
}
