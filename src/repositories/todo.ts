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

