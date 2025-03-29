import { Channel, ConsumeMessage } from "amqplib";
import scannerLogger from "../../libs/logger";
import { getEnvValue } from "../../utils/env.utils";
import QRCode from "qrcode";
import QRCodeRepsotiory from "../../repository/share-portable-qrCode.repository";
import { UrlRepository } from "../../repository/share-portable.repository";
import { FILE_QRCODE_CREATED } from "../../constants/file.constant";
import { IFileStatus } from "../../interfaces/share-portable.interface";

const qrCodeRepository = new QRCodeRepsotiory();
const urlRepository = new UrlRepository();

async function createQRCodeHandlers(
  msg: ConsumeMessage | null,
  channel: Channel
) {
  try {
    if (msg?.content) {
      const content = msg.content.toString();
      const parseContent = JSON.parse(content);

      scannerLogger.info(
        `QRCodeHandler: Message or Payload Received : ${JSON.stringify(
          parseContent
        )}`
      );

      const { zipFilePath, urlId } = parseContent;

      const getBaseUrl = `${getEnvValue("BASE_URL") as string}/${urlId}`;

      const qrCodeDataUrl = await QRCode.toDataURL(getBaseUrl);

      const savedResult = await qrCodeRepository.createQrCodeData(
        urlId,
        qrCodeDataUrl,
        zipFilePath
      );

      const statusUpdated = await urlRepository.changeStatus(
        urlId,
        FILE_QRCODE_CREATED as IFileStatus
      );

      const validUpdated =
        statusUpdated.acknowledged && statusUpdated.matchedCount > 0;

      if (validUpdated)
        scannerLogger.info(
          `CreateQRCodeHandler: The File Status has been Updated to  QR Code Created`
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
