import { Application } from "express";
import scannerLogger from "./libs/logger";
import { SingletonMongoConnection } from "./database/connect";
import mongoose from "mongoose";

class StartExpressApp {
  public serverPort: number;
  public app: Application;
  singletonMongoConnection: typeof mongoose | undefined;

  constructor(serverPort: number, app: Application) {
    this.serverPort = serverPort;
    this.app = app;
  }

  public async startMongoConnection() {
    this.singletonMongoConnection =
      await SingletonMongoConnection.getConnection();
    return this.singletonMongoConnection;
  }

  public async listenOnServer() {
    try {
      this.startMongoConnection().then((connection: typeof mongoose) => {
        scannerLogger.info(
          `Database is Connected, DB Name :${connection.Connection.name}`
        );
        this.app.listen(this.serverPort, () => {
          scannerLogger.info(
            `AppServer: Server is starting on the port : http://localhost:${this.serverPort}/api/v1`
          );
        });
      });
    } catch (err) {
      scannerLogger.error(`AppError: Error while Starting the Express Server`);
    }
  }
}

export default StartExpressApp;
