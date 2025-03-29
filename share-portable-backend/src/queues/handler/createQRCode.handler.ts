import { ConsumeMessage } from "amqplib";
import scannerLogger from "../../libs/logger";

async function createQRCodeHandlers(msg: ConsumeMessage | null) {
  try {
    if (msg?.content) {
      const content = msg.content.toString();
      const parseContent = JSON.parse(content);

      scannerLogger.info(
        `QRCodeHandler: Message or Payload Received : ${JSON.stringify(
          parseContent
        )}`
      );
    }
  } catch (err) {
    scannerLogger.error(
      `QRCodeHandler: Error while consuming the Message Inside the createQRCodeHandler: ${JSON.stringify(
        msg
      )}`
    );
    throw err;
  }
}

export default createQRCodeHandlers;
