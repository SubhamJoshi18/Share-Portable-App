import { HTTP_STATUS } from "../constants/http-status.constant";
import { BadRequestException, ValidationException } from "../exceptions";
import FileHelper from "../helpers/file.helper";
import { IFileCreate } from "../interfaces/share-portable.interface";
import scannerLogger from "../libs/logger";
import path from "path";

const fileHelper = new FileHelper();

async function handleJPEGMimeType(payload: IFileCreate, isJpeg = true) {
  scannerLogger.info(
    `JPEG Handler Extracting and Uploading File and Creating QR Code`
  );

  const { size, path: filePath } = payload;

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

  const copyResult = await fileHelper.uploadToJPEGObject(
    path.join(process.cwd(), filePath)
  );

  if (typeof copyResult === "boolean" && !copyResult) {
    throw new ValidationException(
      HTTP_STATUS.VALIDATION_ERROR.CODE,
      `HandleJPEG: Error while Copying the File to the S3 Bucket`
    );
  }

  
}

export { handleJPEGMimeType };
