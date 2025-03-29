import { Channel, ConsumeMessage } from "amqplib";
import scannerLogger from "../../libs/logger";
import {
  ICreateQRCodePayload,
  ICreateZipPayload,
} from "../../interfaces/share-portable.interface";
import archiver from "archiver";
import FileHelper from "../../helpers/file.helper";
import fs from "fs";
import { stream } from "winston";
import { publishToCreateQRCode } from "../publisher/createQRCodePublisher";
import MainQueueManager from "../MainqueueConsumer";

const fileHelper = new FileHelper();

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

async function createZipHandler(msg: ConsumeMessage | null): Promise<any> {
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

      const channel = await new MainQueueManager().getChannel();

      const publishStatus = await publishToCreateQRCode(
        channel as Channel,
        payloadUploader as unknown as ICreateQRCodePayload
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
