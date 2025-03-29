import scannerLogger from "../libs/logger";
import { HTTP_STATUS } from "../constants/http-status.constant";
import { Request, Response } from "express";

function handleUnexpectedError(): void {
  process.on("uncaughtException", function (err) {
    console.log(
      "****** Unhandled exception in ride-app-backend code ******",
      err
    );
    scannerLogger.error(
      `****** Unhandled exception in ride-app-backend code ****** ${err.message}`
    );
    process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.log("****** Unhandled rejection at ", promise, `reason: ${reason}`);
    scannerLogger.error(
      `****** Unhandled rejection at ${promise} reason: ${reason}`
    );
    process.exit(1);
  });

  process.on("SIGTERM", (signal) => {
    const message = `****** share-portable-app-backend Process ${process.pid} received a SIGTERM signal - ${signal}`;
    console.log(message);
    scannerLogger.error(message);
    process.exit(0);
  });

  process.on("SIGINT", (signal) => {
    const message = `****** share-portable-app-backend Process ${process.pid} received a SIGINT signal - ${signal}`;
    console.log(message);
    scannerLogger.error(message);
    process.exit(0);
  });
}

function handleNotFoundError(req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND.CODE).json({
    message: `The Route : ${req.originalUrl} Does not Exists on the Share Portable App`,
  });
}

function checkValidDoneResult(value: string) {
  return (
    typeof value === "string" &&
    value.includes("done") &&
    value.startsWith("d") &&
    value.endsWith("e")
  );
}

export { handleUnexpectedError, handleNotFoundError, checkValidDoneResult };
