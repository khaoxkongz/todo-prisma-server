import { PrismaClient } from "@prisma/client";
import { ICreateTodo, ITodo } from "../entities";

export function newRepositoryTodo(db: PrismaClient): IRepositoryTodo {
  return new RepositoryTodo(db);
}

export interface IRepositoryTodo {
  getTodos(): Promise<ITodo[]>;
  deleteTodos(): Promise<void>;
  deleteTodoById(id: number): Promise<ITodo>;
  createTodo(arg: ICreateTodo): Promise<ITodo>;
  getTodoById(id: number): Promise<ITodo | null>;
  updateTodo(arg: { id: number; msg: string }): Promise<ITodo>;
}

class RepositoryTodo implements IRepositoryTodo {
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
  }

  public async createTodo(arg: ICreateTodo): Promise<ITodo> {
    return await this.db.todo.create({
      //
      // data: arg,
      //
      // data: {
      // 	msg: arg.msg,
      // 	ownerId: arg.ownerId
      // }
      //
      data: {
        msg: arg.msg,
        owner: {
          connect: {
            id: arg.ownerId,
          },
        },
      },
    });
  }

  public async getTodoById(id: number): Promise<ITodo | null> {
    return await this.db.todo.findUnique({
      where: { id },
    });
  }

  public async getTodos(): Promise<ITodo[]> {
    return await this.db.todo.findMany({
      // where: undefined,
    });
  }

  public async deleteTodoById(id: number): Promise<ITodo> {
    return await this.db.todo.delete({
      where: { id },
    });
  }

  public async deleteTodos(): Promise<void> {
    await this.db.todo.deleteMany();
  }

  public async updateTodo(arg: { id: number; msg: string }): Promise<ITodo> {
    return await this.db.todo.update({
      where: { id: arg.id },
      data: {
        msg: arg.msg,
      },
    });
  }
}
