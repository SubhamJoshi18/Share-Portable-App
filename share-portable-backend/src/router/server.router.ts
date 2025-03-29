import { Application } from "express";
import { handleNotFoundError } from "../utils/error.utils";
import { errorHandler } from "../middlewares/error.middlware";
import { healthRouter } from "./health.router";
import sharePortableRouter from "./share-portable.router";

async function startRouterServer(app: Application) {
  app.use("/api/v1", [healthRouter, sharePortableRouter]);
  app.use("*", handleNotFoundError);
  app.use(errorHandler as any);
}

export { startRouterServer };
