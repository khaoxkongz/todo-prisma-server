import express from "express";

import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";

import { newRepositoryBlacklist, newRepositoryTodo, newRepositoryUser } from "./repositories";
import { newHandlerTodo, newHandlerUser } from "./handler";
import { HandlerMiddleware } from "./auth";

import { expirer } from "./services";
import { REDIS_URL, secret } from "./utils.ts";

async function main() {
  const db = new PrismaClient();
  const redis = createClient({
    url: REDIS_URL,
  });

  try {
    await db.$connect();
    await redis.connect();
  } catch (err) {
    console.error(`got db error: ${err}`);
    return;
  }

  expirer(redis);
  const repoUser = newRepositoryUser(db); // Entities
  const repoBlacklist = newRepositoryBlacklist(redis, secret);
  const handlerUser = newHandlerUser(repoUser, repoBlacklist); // Controller
  const repoTodo = newRepositoryTodo(db);
  const handlerTodo = newHandlerTodo(repoTodo);

  const handlerMiddleware = new HandlerMiddleware(repoBlacklist);

  const port = process.env.PORT || 8000;
  const server = express();
  const userRouter = express.Router(); // Decalre express router
  const todoRouter = express.Router();

  server.use(express.json());

  server.use("/user", userRouter);
  server.use("/todo", todoRouter);

  // Check server status
  server.get("/", (_req, res) => {
    // console.log("req.art", req.art);

    return res.status(200).json({ status: "ok" }).end();
  });

  // User API
  userRouter.post("/register", handlerUser.register.bind(handlerUser));
  userRouter.post("/login", handlerUser.login.bind(handlerUser));
  userRouter.post("/logout", handlerMiddleware.jwtMiddleware.bind(handlerMiddleware), handlerUser.logout.bind(handlerUser));

  // To-do API
  todoRouter.use(handlerMiddleware.jwtMiddleware.bind(handlerMiddleware));
  todoRouter.post("/", handlerTodo.createTodo.bind(handlerTodo));
  todoRouter.get("/", handlerTodo.getTodos.bind(handlerTodo));
  todoRouter.get("/:id", handlerTodo.getTodo.bind(handlerTodo));
  // Guard invalid path for missing `id`
  todoRouter.post("/update", async (_, res) => {
    return res.status(400).json({ error: "missing params id" }).end();
  });
  todoRouter.post("/update/:id", handlerTodo.updateTodo.bind(handlerTodo));
  todoRouter.delete("/delete", handlerTodo.deleteTodos.bind(handlerTodo));
  todoRouter.delete("/delete/:id", handlerTodo.deleteTodo.bind(handlerTodo));

  server.listen(port, () => console.log(`server listening on ${port}`));
}

main();
