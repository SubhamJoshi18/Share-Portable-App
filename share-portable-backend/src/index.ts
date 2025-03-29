import express, { Application } from "express";
import StartExpressApp from "./server";
import { getEnvValue } from "./utils/env.utils";
import scannerLogger from "./libs/logger";
import { startMiddlewareServer } from "./middlewares/server.middleware";
import { startRouterServer } from "./router/server.router";
import { handleUnexpectedError } from "./utils/error.utils";

const app = express();
const port =
  typeof getEnvValue("PORT") === "string"
    ? Number(getEnvValue("PORT"))
    : getEnvValue("PORT");

async function startServer() {
  try {
    await Promise.all([startMiddlewareServer(app), startRouterServer(app)]);
    handleUnexpectedError();
    const appInstancse = new StartExpressApp(
      port as number,
      app as Application
    );
    await appInstancse.listenOnServer();
  } catch (err) {
    scannerLogger.error(
      `ServerError: Error while starting the Server due to Interal Issue`
    );
  }
}

(async () => {
  await startServer();
})();
