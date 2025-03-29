import { Application } from "express";
import { handleNotFoundError } from "../utils/error.utils";
import { errorHandler } from "../middlewares/error.middlware";
import { healthRouter } from "./health.router";

async function startRouterServer(app: Application) {
  app.use("/api/v1", [healthRouter]);
  app.use("*", handleNotFoundError);
  app.use(errorHandler as any);
}

export { startRouterServer };
