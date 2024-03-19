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

export function newHandlerTodo(repoTodo: IRepositoryTodo): IHandlerTodo {
  return new handlerTodo(repoTodo);
}

class handlerTodo implements IHandlerTodo {
  private repo: IRepositoryTodo;

  constructor(repo: IRepositoryTodo) {
    this.repo = repo;
  }

  public async createTodo(req: JwtAuthRequest<IEmpty, IWithMsg>, res: Response): Promise<Response> {
    const { msg } = req.body;
    if (!msg) {
      return res.status(400).json({ error: "missing msg in json body" }).end();
    }

    // const ownerid = req.payload.id;
    const { id: ownerId } = req.payload;
    if (!ownerId) {
      return res.status(400).json({ error: "missing payload id" }).end();
    }

    return this.repo
      .createTodo({ msg, ownerId })
      .then((todo) => res.status(201).json(todo).end())
      .catch((err) => {
        const errMsg = `failed to create todo`;
        console.error(`${errMsg}: ${err}`);
        return res.status(500).json({ error: errMsg }).end();
      });
  }

  public async getTodos(req: JwtAuthRequest<IEmpty, IEmpty>, res: Response): Promise<Response> {
    return this.repo
      .getUserTodos(req.payload.id)
      .then((todos) => res.status(200).json({ data: todos }).end())
      .catch((err) => {
        const errMsg = `failed to get all todo`;
        console.error(`${errMsg}: ${err}`);
        return res.status(500).json({ error: errMsg }).end();
      });
  }

  public async getTodo(req: JwtAuthRequest<IWithId, IEmpty>, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    // isNaN checks if its arg is NaN
    if (isNaN(id)) {
      return res.status(400).json({ error: `id ${req.params.id} is not a number` });
    }

    return this.repo
      .getUserTodoById({ id, ownerId: req.payload.id })
      .then((todo) => {
        if (!todo) {
          return res.status(404).json({ error: `no such todo: ${id} ` });
        }

        return res.status(200).json(todo).end();
      })
      .catch((err) => {
        const errMsg = `failed to get todo ${id}`;
        console.error(`${errMsg}: ${err}`);
        return res.status(500).json({ error: errMsg });
      });
  }

  public async updateTodo(req: JwtAuthRequest<IWithId, IWithMsg>, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    // isNaN checks if its arg is NaN
    if (isNaN(id)) {
      return res.status(400).json({ error: `id ${req.params.id} is not a number }` });
    }
    const { msg } = req.body;

    if (!msg) {
      return res.status(400).json({ error: "missing msg in json body" }).end();
    }

    return this.repo
      .updateUserTodo({ id, ownerId: req.payload.id, msg })
      .then((updated) => res.status(201).json(updated).end())
      .catch((err) => {
        const errMsg = `failed to update todo ${id}`;
        console.error(`${errMsg}: ${err}`);
        return res.status(500).json({ error: errMsg }).end();
      });
  }

  public async deleteTodo(req: JwtAuthRequest<IWithId, IEmpty>, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    // isNaN checks if its arg is NaN
    if (isNaN(id)) {
      return res.status(400).json({ error: `id ${req.params.id} is not a number} ` });
    }

    return this.repo
      .deleteUserTodoById({ id, ownerId: req.payload.id })
      .then((deleted) => res.status(200).json(deleted).end())
      .catch((err) => {
        const errMsg = `failed to delete todo ${id}`;
        console.error(`${errMsg}: ${err}`);
        return res.status(500).json({ error: errMsg });
      });
  }

  public async deleteTodos(req: JwtAuthRequest<IEmpty, IEmpty>, res: Response): Promise<Response> {
    return this.repo
      .deleteUserTodos(req.payload.id)
      .then(() => res.status(200).json({ status: "todos cleared successfully" }))
      .catch((err) => {
        const errMsg = `failed to clear todos`;
        console.error(`${errMsg}: ${err}`);
        return res.status(500).json({ error: errMsg }).end();
      });
  }
}
