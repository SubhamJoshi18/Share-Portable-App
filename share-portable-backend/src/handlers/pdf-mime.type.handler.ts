import { HTTP_STATUS } from "../constants/http-status.constant";
import { BadRequestException, ValidationException } from "../exceptions";
import FileHelper from "../helpers/file.helper";
import {
  ICreateZipPayload,
  IFileCreate,
  IFileStatus,
} from "../interfaces/share-portable.interface";
import scannerLogger from "../libs/logger";
import MainQueueManager from "../queues/MainqueueConsumer";
import path from "path";
import { UrlRepository } from "../repository/share-portable.repository";
import { FILE_COPIED } from "../constants/file.constant";
import { publishToCreateZipFile } from "../queues/publisher/createZipPublisher";
import { Channel } from "amqplib";

const fileHelper = new FileHelper();
const urlRepository = new UrlRepository();

async function handlePDFJsonType(payload: IFileCreate, isJson = true) {
  const channel = await new MainQueueManager().getChannel();

  return new Promise(async (resolve, reject) => {
    scannerLogger.info(
      `PDF Handler Extracting and Uploading File and Creating QR Code`
    );

    const { size, path: filePath, urlId } = payload;

    const isValidFileSize = !isNaN(size) && Math.ceil(size) > 0;

    if (!isValidFileSize) {
      throw new ValidationException(
        HTTP_STATUS.VALIDATION_ERROR.CODE,
        `HandlePDF: The File is Potential Empty, Please Enter a Non Empty File`
      );
    }

    const S3BucketPath = await fileHelper.getS3BucketPath();

    if (!S3BucketPath.trim()) {
      throw new BadRequestException(
        HTTP_STATUS.BAD_REQUEST.CODE,
        `The S3 Bucket Path is Missing`
      );
    }

    const { status, path: finalCopyPath } = await fileHelper.uploadToPdf(
      payload["urlId"] as string,
      path.join(process.cwd(), filePath)
    );

    if (typeof status === "boolean" && !status) {
      throw new ValidationException(
        HTTP_STATUS.VALIDATION_ERROR.CODE,
        `HandlePDF: Error while Copying the File to the S3 Bucket`
      );
    }

    const updatedStatus = await urlRepository.changeStatus(
      urlId as string,
      FILE_COPIED as IFileStatus
    );

    const validUpdated =
      updatedStatus.acknowledged && updatedStatus.matchedCount > 0;

    if (validUpdated) {
      scannerLogger.info(
        `HandlePDF: The Status of File has been Changed to Copied to S3 Bucket`
      );
    }

    const urlPayload = Object.preventExtensions({
      urlId: urlId,
      filePath: finalCopyPath,
      fileType: "pdf",
    });

    scannerLogger.info(
      `HandlePDF: Publishing Payload : ${JSON.stringify(urlPayload)} `
    );

    const publishResult = await publishToCreateZipFile(
      channel as Channel,
      urlPayload as ICreateZipPayload
    );
    resolve(urlId);
  });
}

export { handlePDFJsonType };
