import { Request, Response } from "express";
import { JwtAuthRequest } from "../auth";
import { IEmpty } from "../interfaces";
import { IRepositoryTodo } from "../repositories";

type HandlerFunc<Req> = (req: Req, res: Response) => Promise<Response>;

export interface IWithId {
  id: string;
}

export interface IWithMsg {
  msg: string;
}

export interface IHandlerTodo {
  getTodo: HandlerFunc<JwtAuthRequest<IWithId, any>>;
  getTodos: HandlerFunc<JwtAuthRequest<Request, any>>;
  createTodo: HandlerFunc<JwtAuthRequest<IEmpty, IWithMsg>>;
  updateTodo: HandlerFunc<JwtAuthRequest<IWithId, IWithMsg>>;
  deleteTodo: HandlerFunc<JwtAuthRequest<IWithId, IEmpty>>;
  deleteTodos: HandlerFunc<JwtAuthRequest<IEmpty, IEmpty>>;
}

