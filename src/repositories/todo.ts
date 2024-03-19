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
  getUserTodos(ownerId: number): Promise<ITodo[]>;
  deleteUserTodos(ownerId: number): Promise<void>;
  deleteUserTodoById(arg: { id: number; ownerId: number }): Promise<ITodo>;
  getUserTodoById(arg: { id: number; ownerId: number }): Promise<ITodo | null>;
  updateUserTodo(arg: { id: number; ownerId: number; msg: string }): Promise<ITodo>;
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

  public async getUserTodos(ownerId: number): Promise<ITodo[]> {
    return await this.db.todo.findMany({
      where: { ownerId },
    });
  }

  public async getUserTodoById(arg: { id: number; ownerId: number }): Promise<ITodo | null> {
    return await this.db.todo.findUnique({
      where: { id: arg.id },
    });
  }

  public async deleteTodoById(id: number): Promise<ITodo> {
    return await this.db.todo.delete({
      where: { id },
    });
  }

  // public async deleteUserTodoById(arg: { id: number; ownerId: number }): Promise<ITodo> {
  //   const todo = await this.db.todo.findFirst({
  //     where: { id: arg.id, ownerId: arg.ownerId },
  //   });

  //   if (!todo) {
  //     return Promise.reject(`no such todo: ${arg.id}`);
  //   }

  //   return await this.db.todo.delete({ where: { id: arg.id } });
  // }

  public async deleteUserTodoById(arg: { id: number; ownerId: number }): Promise<ITodo> {
    const todo = await this.db.todo.findUnique({
      where: { id: arg.id },
    });

    if (!todo) {
      return Promise.reject(`no such todo: ${arg.id}`);
    }

    if (todo.ownerId !== arg.ownerId) {
      return Promise.reject(`bad ownerId: ${arg.ownerId}`);
    }

    return await this.db.todo.delete({ where: { id: arg.id } });
  }

  public async deleteTodos(): Promise<void> {
    await this.db.todo.deleteMany();
  }

  public async deleteUserTodos(ownerId: number): Promise<void> {
    await this.db.todo.deleteMany({ where: { ownerId } });
  }

  public async updateTodo(arg: { id: number; msg: string }): Promise<ITodo> {
    return await this.db.todo.update({
      where: { id: arg.id },
      data: {
        msg: arg.msg,
      },
    });
  }

  public async updateUserTodo(arg: { id: number; ownerId: number; msg: string }): Promise<ITodo> {
    const todo = await this.db.todo.findUnique({
      where: { id: arg.id },
    });

    if (!todo) {
      return Promise.reject(`todo ${arg.id} not found`);
    }

    if (todo.ownerId !== arg.ownerId) {
      return Promise.reject(`bad ownerId: ${arg.ownerId}`);
    }

    return await this.db.todo.update({
      where: { id: arg.id },
      data: { msg: arg.msg },
    });
  }
}
