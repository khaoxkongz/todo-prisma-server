import { RedisClientType } from "redis";
import { decode } from "jsonwebtoken";

export const keyBlacklist = "todo-jwt-blacklist"; // set
export const keyJwtExpire = "todo-jwt-expirations"; // hash

export interface IRepositoryBlacklist {
  addToBlacklist(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}

export function newRepositoryBlacklist(db: RedisClientType<any, any, any>): IRepositoryBlacklist {
  return new RepositoryBlacklist(db);
}

class RepositoryBlacklist {
  private db: RedisClientType<any>;

  constructor(db: RedisClientType<any>) {
    this.db = db;
  }

  private async sAdd(token: string): Promise<void> {
    await this.db.sAdd(keyBlacklist, token);
  }

  public async addToBlacklist(token: string): Promise<void> {
    const decoded = decode(token);
    if (!decoded) {
      return this.sAdd(token);
    }
    if (typeof decoded === "string") {
      return this.sAdd(token);
    }

    const exp = decoded.exp;
    if (!exp) {
      return this.sAdd(token);
    }

    // try {
    await this.sAdd(token);
    await this.db.hSet(keyJwtExpire, token, exp);
    // } catch (err) {
    // console.log({ token, t: typeof token });
    // console.error(err);
    // }
  }

  public async isBlacklisted(token: string): Promise<boolean> {
    return await this.db.sIsMember(keyBlacklist, token);
  }
}
