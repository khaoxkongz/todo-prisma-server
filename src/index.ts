import express from "express";

import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";

import { newRepositoryBlacklist, newRepositoryTodo, newRepositoryUser } from "./repositories";
import { newHandlerTodo, newHandlerUser } from "./handler";
import { HandlerMiddleware } from "./auth";

async function main() {
  const db = new PrismaClient();
  const redis = createClient({
    socket: {
      host: "localhost",
      port: 6379,
    },
  });

  try {
    await db.$connect();
    await redis.connect();
  } catch (err) {
    console.error(`got db error: ${err}`);
    return;
  }

  const repoUser = newRepositoryUser(db); // Entities
  const repoBlacklist = newRepositoryBlacklist(redis);
  const handlerUser = newHandlerUser(repoUser, repoBlacklist); // Controller
  const repoTodo = newRepositoryTodo(db);
  const handlerTodo = newHandlerTodo(repoTodo);

  const handlerMiddleware = new HandlerMiddleware(repoBlacklist);

  const port = process.env.PORT || 8000;
  const server = express();
  const userRouter = express.Router(); // Decalre express router

  server.use(express.json());

  server.use("/user", userRouter);

  // Check server status
  server.get("/", (_req, res) => {
    // console.log("req.art", req.art);

    return res.status(200).json({ status: "ok" }).end();
  });

  // User API
  userRouter.post("/register", handlerUser.register.bind(handlerUser));
  userRouter.post("/login", handlerUser.login.bind(handlerUser));
  userRouter.post(
    "/logout",
    handlerMiddleware.jwtMiddleware.bind(handlerMiddleware),
    handlerUser.logout.bind(handlerUser)
  );

  server.listen(port, () => console.log(`server listening on ${port}`));
}

main();
