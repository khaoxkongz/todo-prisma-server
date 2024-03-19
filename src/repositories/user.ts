import { PrismaClient } from "@prisma/client";
import { ICreateUser, IUser } from "../entities";

export interface IRepositoryUser {
  createUser(user: ICreateUser): Promise<IUser>;
  getUser(username: string): Promise<IUser>;
}

export function newRepositoryUser(db: PrismaClient): IRepositoryUser {
  return new RepositoryUser(db);
}

class RepositoryUser implements IRepositoryUser {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  public async createUser(user: ICreateUser): Promise<IUser> {
    return await this.db.user
      .create({ data: user })
      .catch((err) => Promise.reject(`failed to create user ${user.username}: ${err}`));
  }

  // Reject if not found
  public async getUser(username: string): Promise<IUser> {
    return await this.db.user.findUnique({ where: { username } }).then((user) => {
      if (!user) {
        return Promise.reject(`no such user ${username}`);
      }
      return Promise.resolve(user);
    });
  }
}
