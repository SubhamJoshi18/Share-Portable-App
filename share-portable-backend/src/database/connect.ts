import mongoose from "mongoose";
import { getEnvValue } from "../utils/env.utils";

class SingletonMongoConnection {
  public static monogConnection: typeof mongoose;
  public static mongoUrl = getEnvValue("MONGO_URL");

  public static async initializeConnection() {
    if (!this.monogConnection) {
      this.monogConnection = await mongoose.connect(this.mongoUrl as string);
      return this.monogConnection;
    } else {
      return this.monogConnection;
    }
  }

  public static async getConnection() {
    if (
      !this.monogConnection ||
      typeof this.monogConnection !== typeof mongoose
    ) {
      await this.initializeConnection();
    }
    return this.monogConnection;
  }
}

export { SingletonMongoConnection };
