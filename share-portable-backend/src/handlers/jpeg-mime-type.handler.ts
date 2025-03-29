import { HTTP_STATUS } from "../constants/http-status.constant";
import { BadRequestException, ValidationException } from "../exceptions";
import FileHelper from "../helpers/file.helper";
import {
  ICreateZipPayload,
  IFileCreate,
  IFileStatus,
} from "../interfaces/share-portable.interface";
import scannerLogger from "../libs/logger";
import path from "path";
import { UrlRepository } from "../repository/share-portable.repository";
import { FILE_COPIED } from "../constants/file.constant";
import MainQueueManager from "../queues/MainqueueConsumer";
import { publishToCreateZipFile } from "../queues/publisher/createZipPublisher";
import { Channel } from "amqplib";

const fileHelper = new FileHelper();
const urlRepostiory = new UrlRepository();

async function handleJPEGMimeType(payload: IFileCreate, isJpeg = true) {
  const channel = await new MainQueueManager().getChannel();
  return new Promise(async (resolve, reject) => {
    scannerLogger.info(
      `JPEG Handler Extracting and Uploading File and Creating QR Code`
    );

    const { size, path: filePath, urlId } = payload;

    const isValidFileSize = !isNaN(size) && Math.ceil(size) > 0;

    if (!isValidFileSize) {
      throw new ValidationException(
        HTTP_STATUS.VALIDATION_ERROR.CODE,
        `
            HandleJPEG: The File is Potential Empty, Please Enter a Non Empty File`
      );
    }

    const S3BucketPath = await fileHelper.getS3BucketPath();

    if (!S3BucketPath.trim()) {
      throw new BadRequestException(
        HTTP_STATUS.BAD_REQUEST.CODE,
        `The S3 Bucket Path is Missing`
      );
    }

    const { status, path: finalCopyPath } = await fileHelper.uploadToJPEGObject(
      path.join(process.cwd(), filePath)
    );

    if (typeof status === "boolean" && !status) {
      throw new ValidationException(
        HTTP_STATUS.VALIDATION_ERROR.CODE,
        `HandleJPEG: Error while Copying the File to the S3 Bucket`
      );
    }

    const updatedStatus = await urlRepostiory.changeStatus(
      urlId as string,
      FILE_COPIED as IFileStatus
    );

    const validUpdated =
      updatedStatus.acknowledged && updatedStatus.matchedCount > 0;

    if (validUpdated) {
      scannerLogger.info(
        `The Status of File has been Changed to Copied to S3 Bucket`
      );
    }

    const urlPayload = Object.preventExtensions({
      urlId: urlId,
      filePath: finalCopyPath,
    });

    scannerLogger.info(`Publishing Payload : ${JSON.stringify(urlPayload)} `);

    const publishResult = await publishToCreateZipFile(
      channel as Channel,
      urlPayload as ICreateZipPayload
    );
    resolve(
      typeof publishResult === "boolean" && publishResult ? "done" : "failed"
    );
  });
}

export { handleJPEGMimeType };
