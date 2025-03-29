import { FILE_MODULES } from "../constants/file.constant";
import { HTTP_STATUS } from "../constants/http-status.constant";
import {
  BadRequestException,
  DatabaseException,
  ValidationException,
} from "../exceptions";
import { IFileCreate } from "../interfaces/share-portable.interface";
import { fileMimeTypes } from "../config/file.config";
import { transformAndHandleMimeTypes } from "../transform/share-portable-transform";
import { checkValidDoneResult } from "../utils/error.utils";
import crypto from "crypto";
import { UrlRepository } from "../repository/share-portable.repository";
import scannerLogger from "../libs/logger";
import FileHelper from "../helpers/file.helper";
import QRCodeRepsotiory from "../repository/share-portable-qrCode.repository";

class SharePortableService {
  public urlRepostiory: UrlRepository;
  public qrCodeRepository: QRCodeRepsotiory;
  public fileHelper: FileHelper;

  constructor() {
    this.urlRepostiory = new UrlRepository();
    this.fileHelper = new FileHelper();
    this.qrCodeRepository = new QRCodeRepsotiory();
  }

  public async uploadFileServices(filePayload: IFileCreate) {
    const { originalname, encoding, mimetype, fieldname } = filePayload;

    const isValidFieldName =
      fieldname.includes(FILE_MODULES) && fieldname.length > 0;

    if (!isValidFieldName)
      throw new ValidationException(
        HTTP_STATUS.VALIDATION_ERROR.CODE,
        `The File Name is Required, File Name String is Missing`
      );

    const [fileType, fileMimeType] =
      typeof mimetype === "string" ? mimetype.split("/") : ["", ""];

    const isValidMimeTypes =
      Object.keys(fileMimeTypes).includes(fileMimeType.trim().toLowerCase()) &&
      fileMimeType in fileMimeTypes;

    if (typeof isValidMimeTypes === "boolean" && !isValidMimeTypes) {
      throw new ValidationException(
        HTTP_STATUS.VALIDATION_ERROR.CODE,
        `The Mime Type is not Supported For this System`
      );
    }

    const removeMimeType =
      "mimetype" in filePayload ? delete filePayload["mimetype"] : filePayload;

    const fileData = JSON.stringify(
      Object.preventExtensions({ ...filePayload })
    );

    let urlId = crypto.createHash("sha256").update(fileData).digest("hex");

    const isUrlExists = await this.urlRepostiory.findUrlId(urlId);

    if (isUrlExists) {
      scannerLogger.info(
        `Url Already Exists, Recreating New Hash Url Id For : ${JSON.stringify(
          filePayload
        )} `
      );
      urlId = crypto.createHash("sha256").update(fileData).digest("hex");
    }

    const saveInitialResult = await this.urlRepostiory.createResult(urlId);

    scannerLogger.info(
      `The URL ID : ${urlId} Has been Initial Saved Successfully with Id : ${saveInitialResult._id}`
    );

    if (saveInitialResult) {
      Object.assign(filePayload, { urlId: saveInitialResult.urlId });
    }

    const result = await transformAndHandleMimeTypes(
      filePayload as IFileCreate,
      fileMimeType as string
    );

    if (!checkValidDoneResult(result as string)) {
      throw new BadRequestException(
        HTTP_STATUS.BAD_REQUEST.CODE,
        `
            The File Upload and Publish Process Has been Failed, Reprocessing Again`
      );
    }

    scannerLogger.info(`Clearing the Uploads Directory`);

    await this.fileHelper.clearTheUploadFiles();

    return {
      message: `The Message has been Extracted and Created and Published`,
    };
  }

  public async downloadQrCodeData(urlId: string) {
    const isUrlExists = await this.urlRepostiory.findUrlId(urlId);

    if (!isUrlExists) {
      throw new DatabaseException(
        HTTP_STATUS.DATABASE_ERROR.CODE,
        `The URL ID : ${urlId} Does not Exists on the System`
      );
    }

    const isQrExistsForUrl = await this.qrCodeRepository.findUrlIdInQRCode(
      urlId
    );

    if (!isQrExistsForUrl) {
      throw new DatabaseException(
        HTTP_STATUS.DATABASE_ERROR.CODE,
        `The URL ID : ${urlId} Does not Exists on the QR Code Repostiory `
      );
    }

    const S3BucketPath = isQrExistsForUrl.S3BucketFilePath;
    return S3BucketPath;
  }

  public async getQrCode(urlId: string) {
    const isUrlExists = await this.urlRepostiory.findUrlId(urlId);

    if (!isUrlExists) {
      throw new DatabaseException(
        HTTP_STATUS.DATABASE_ERROR.CODE,
        `The URL ID : ${urlId} Does not Exists on the System`
      );
    }

    const isQrExistsForUrl = await this.qrCodeRepository.findUrlIdInQRCode(
      urlId
    );

    if (!isQrExistsForUrl) {
      throw new DatabaseException(
        HTTP_STATUS.DATABASE_ERROR.CODE,
        `The URL ID : ${urlId} Does not Exists on the QR Code Repostiory `
      );
    }

    const qrDataUrl = isQrExistsForUrl.qrCodeDataUrl;
    return qrDataUrl;
  }
}

export default new SharePortableService();
