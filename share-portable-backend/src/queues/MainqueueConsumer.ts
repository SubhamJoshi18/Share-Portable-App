import scannerLogger from "../libs/logger";
import { getEnvValue } from "../utils/env.utils";
import amqplib, { Channel } from "amqplib";
import initQueueConsumer from "./consumers/initQueueConsumer";

class MainQueueManager {
  public rabbitmqUrl: string;
  public connection: amqplib.ChannelModel | null = null;
  public channel: amqplib.Channel | null = null;

  constructor(rabbitmqUrl = getEnvValue("RABBITMQ_URL")) {
    this.rabbitmqUrl = rabbitmqUrl as string;
  }

  public async initalizeConnection(
    retries = 0,
    MAX_RETRIES = 5,
    INITIAL_DELAY_MS = 1000
  ): Promise<any> {
    try {
      this.connection = await amqplib.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
    } catch (err) {
      scannerLogger.error(
        `ConnectionError: Error while Connecting to the RabbitMQ`
      );
      if (retries < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS ** (2 ** retries);
        scannerLogger.error(
          `Retrying (${retries + 1}/${MAX_RETRIES}) in ${delay}ms...`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.initalizeConnection(retries + 1);
      }
      scannerLogger.error("Maximum retries reached. Exiting process.");
      process.exit(1);
    }
  }

  public async getChannel() {
    if (!this.channel) {
      await this.initalizeConnection();
    }
    return this.channel;
  }

  public async getConnection() {
    if (this.connection) {
      await this.initalizeConnection();
    }
    return this.connection;
  }

  public async startAllConsumer(isStart = false) {
    if (isStart) {
      await this.initalizeConnection();
      await initQueueConsumer((await this.getChannel()) as Channel);
    }
  }
}

export default MainQueueManager;
