import { Channel } from "amqplib";
import {
  ICreateQRCodePayload,
  ICreateZipPayload,
  IFileStatus,
} from "../../interfaces/share-portable.interface";
import scannerLogger from "../../libs/logger";
import {
  createQRCodeQueueConfig,
  createZipQueueConfig,
} from "../../config/queue.config";
import { UrlRepository } from "../../repository/share-portable.repository";
import {
  FILE_PUSH_TO_QRCODE_CONSUMER,
  FILE_PUSH_TO_ZIPCONSUMER,
} from "../../constants/file.constant";

const urlRepostiory = new UrlRepository();

async function publishToCreateQRCode(
  channel: Channel,
  payload: ICreateQRCodePayload
) {
  const getQueueConfig = createQRCodeQueueConfig();
  return new Promise(async (resolve, reject) => {
    const { queueName, queueExchange, queueRoutingKey } = getQueueConfig;
    try {
      await channel.assertExchange(queueExchange, "direct", { durable: true });
      await channel.assertQueue(queueName, { durable: true });
      await channel.bindQueue(queueName, queueExchange, queueRoutingKey);
      await channel.prefetch(1);
      const bufferString = Buffer.from(JSON.stringify(payload));
      channel.publish(queueExchange, queueRoutingKey, bufferString);
      scannerLogger.info(
        `CreateQRCodePublisher: Message has been Published to the ${queueName}`
      );
      const updatedStatus = await urlRepostiory.changeStatus(
        payload["urlId"],
        FILE_PUSH_TO_QRCODE_CONSUMER as IFileStatus
      );

      const validUpdated =
        updatedStatus.acknowledged && updatedStatus.matchedCount > 0;

      if (validUpdated)
        scannerLogger.info(
          `CreateQRCodePublisher: The File Status has been Updated to Push to QR Code Consumer`
        );

      resolve(true);
    } catch (err) {
      scannerLogger.error(
        `CreateQRCodePublisher: Error while publishing the message to the ${queueName}`
      );
      reject(err);
    }
  });
}
export { publishToCreateQRCode };
