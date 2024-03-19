import { RedisClientType } from "redis";
import { verify } from "jsonwebtoken";

export const BLACKLIST_KEY = "jwt-blacklist";
export const EXPIRATION_KEY = "jwt-expirations";

export interface IRepositoryBlacklist {
  addToBlacklist(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}

export function newRepositoryBlacklist(redisClient: RedisClientType<any, any, any>, publicKey: string): IRepositoryBlacklist {
  return new BlacklistRepository(redisClient, publicKey);
}

class BlacklistRepository implements IRepositoryBlacklist {
  private redisClient: RedisClientType<any, any, any>;
  private publicKey: string;

  constructor(redisClient: RedisClientType<any, any, any>, publicKey: string) {
    this.redisClient = redisClient;
    this.publicKey = publicKey;
  }

  private async addToBlacklistAndExpiration(token: string, expiration: number): Promise<void> {
    const multi = this.redisClient.multi();
    multi.sAdd(BLACKLIST_KEY, token);
    multi.hSet(EXPIRATION_KEY, token, expiration);
    await multi.exec();
  }

  public async addToBlacklist(token: string): Promise<void> {
    try {
      const decoded = verify(token, this.publicKey);
      if (typeof decoded === "object" && decoded.exp) {
        await this.addToBlacklistAndExpiration(token, decoded.exp);
      } else {
        await this.redisClient.sAdd(BLACKLIST_KEY, token);
      }
    } catch (err) {
      console.error("Error adding token to blacklist:", err);
    }
  }

  public async isBlacklisted(token: string): Promise<boolean> {
    try {
      return await this.redisClient.sIsMember(BLACKLIST_KEY, token);
    } catch (err) {
      console.error("Error checking if token is blacklisted:", err);
      return false;
    }
  }
}
