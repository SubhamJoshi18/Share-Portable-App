import { Channel, ConsumeMessage } from "amqplib";
import scannerLogger from "../../libs/logger";
import {
  ICreateQRCodePayload,
  ICreateZipPayload,
  IFileStatus,
} from "../../interfaces/share-portable.interface";
import archiver from "archiver";
import FileHelper from "../../helpers/file.helper";
import fs from "fs";
import { publishToCreateQRCode } from "../publisher/createQRCodePublisher";
import { UrlRepository } from "../../repository/share-portable.repository";
import { FILE_PUSH_TO_QRCODE_CONSUMER } from "../../constants/file.constant";

const fileHelper = new FileHelper();
const urlRepostiory = new UrlRepository();

async function processZipFiles(
  sourceDir: string,
  archieve: archiver.Archiver,
  stream: fs.WriteStream
) {
  return new Promise<void>((resolve, reject) => {
    archieve.directory(sourceDir, false).on("error", (err) => reject(err));

    archieve.pipe(stream);

    stream.on("close", () => resolve());
    stream.on("end", () => resolve());

    archieve.finalize();
  });
}

async function createZipHandler(
  msg: ConsumeMessage | null,
  channel: Channel
): Promise<any> {
  try {
    if (msg?.content) {
      const content = msg.content.toString();
      const parseContent = JSON.parse(content);

      scannerLogger.info(
        `ZipHandler: Message or Payload Received : ${JSON.stringify(
          parseContent
        )}`
      );

      const { urlId, filePath, fileType } = parseContent as ICreateZipPayload;

      const getMimeS3BucketPath = await fileHelper.getObjectBasedOnMimeType(
        fileType.toUpperCase(),
        urlId
      );

      scannerLogger.info(
        `Creating ZIP File For the  Mime Type : ${fileType.toUpperCase()}`
      );

      const allobject = await fileHelper.listAllFiles(getMimeS3BucketPath);

      const archieve = archiver("zip", { zlib: { level: 9 } });

      const zipFilePath = await fileHelper.createZipFileBasedOnUrlId(
        fileType,
        urlId
      );
      const stream = fs.createWriteStream(zipFilePath);

      const processedZipFiles = await processZipFiles(
        getMimeS3BucketPath,
        archieve,
        stream
      );

      const payloadUploader = Object.preventExtensions({
        urlId,
        zipFilePath: zipFilePath,
        fileType: "jpeg",
        isZipFile: true,
      });

      scannerLogger.info(
        `Publishing the ZIP File to the Create QR Code Consumer`
      );

      const publishStatus = await publishToCreateQRCode(
        channel as Channel,
        payloadUploader as unknown as ICreateQRCodePayload
      );

      const updatedStatus = await urlRepostiory.changeStatus(
        urlId,
        FILE_PUSH_TO_QRCODE_CONSUMER as IFileStatus
      );

      const validUpdated =
        updatedStatus.acknowledged && updatedStatus.matchedCount > 0;

      if (validUpdated)
        scannerLogger.info(
          `CreateQRCodePublisher: The File Status has been Updated to Push to QR Code Consumer`
        );

      const validPush = typeof publishStatus === "boolean" && publishStatus;

      return validPush
        ? {
            pushStatus: validPush,
          }
        : {
            pushStatus: false,
          };
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
