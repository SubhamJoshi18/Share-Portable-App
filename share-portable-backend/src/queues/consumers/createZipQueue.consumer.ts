import { Channel, ConsumeMessage } from "amqplib";
import scannerLogger from "../../libs/logger";
import { createZipQueueConfig } from "../../config/queue.config";
import createZipHandler from "../handler/createZip.handler";

async function createZipConsumer(channel: Channel) {
  try {
    const getQueueConfig = createZipQueueConfig();
    const { queueName, queueExchange, queueRoutingKey } = getQueueConfig;

    await channel.assertExchange(queueExchange, "direct", { durable: true });

    await channel.assertQueue(queueName, { durable: true });

    await channel.bindQueue(queueName, queueExchange, queueRoutingKey);

    scannerLogger.info(
      `ZipConsumer: Waiting For Payload in the Create Zip Consumer`
    );

    channel.consume(queueName, async (message: ConsumeMessage | null) => {
      try {
        await createZipHandler(message);
      } catch (err) {
        scannerLogger.error(
          `ZipConsumer: Error while handling the ZIP Consumer`
        );
        throw err;
      } finally {
        if (channel && message) {
          channel.ack(message);
        }
      }
    });
  } catch (err) {
    scannerLogger.error(
      `ZipConsumer: Error while handling the or Consuming the Payload`
    );
    throw err;
  }
}

export default createZipConsumer;
