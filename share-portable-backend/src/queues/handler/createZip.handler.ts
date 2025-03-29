import { ConsumeMessage } from "amqplib";
import scannerLogger from "../../libs/logger";

async function createZipHandler(msg: ConsumeMessage | null) {
  try {
    if (msg?.content) {
      const content = msg.content.toString();
      const parseContent = JSON.parse(content);

      scannerLogger.info(
        `ZipHandler: Message or Payload Received : ${JSON.stringify(
          parseContent
        )}`
      );
    }
  } catch (err) {
    scannerLogger.error(
      `Error while consuming the Message Inside the CreateZipHandler: ${JSON.stringify(
        msg
      )}`
    );
    throw err;
  }
}

export default createZipHandler;
