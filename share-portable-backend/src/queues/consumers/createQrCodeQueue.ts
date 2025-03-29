import { Channel, ConsumeMessage } from "amqplib";
import scannerLogger from "../../libs/logger";
import {
  createQRCodeQueueConfig,
  createZipQueueConfig,
} from "../../config/queue.config";
import createZipHandler from "../handler/createZip.handler";

async function createQRCodeConsumer(channel: Channel) {
  try {
    const getQueueConfig = createQRCodeQueueConfig();
    const { queueName, queueExchange, queueRoutingKey } = getQueueConfig;

    await channel.assertExchange(queueExchange, "direct", { durable: true });

    await channel.assertQueue(queueName, { durable: true });

    await channel.bindQueue(queueName, queueExchange, queueRoutingKey);

    scannerLogger.info(
      `QRCodeConsumer: Waiting For Payload in the Create QRCode Consumer`
    );

    channel.consume(queueName, async (message: ConsumeMessage | null) => {
      try {
        await createZipHandler(message);
      } catch (err) {
        scannerLogger.error(
          `QRCodeConsumer: Error while handling the QRCode Consumer`
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
      `QRCodeConsumer: Error while handling the or Consuming the Payload`
    );
    throw err;
  }
}

export default createQRCodeConsumer;
