import { Request, Response, NextFunction } from "express";
import { createFileSchema } from "../validation/share-portable.validation";
import { z } from "zod";
import scannerLogger from "../libs/logger";
import { mapZodMessages } from "../mapper/share-portable.mapper";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response.utils";
import SharePortableService from "../services/share-portable.service";

class SharePortableController {
  public async uploadFileController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const fileContent = req.file;
      const parseContent = createFileSchema.parse(fileContent);
      console.log(parseContent);
      const apiResponse = await SharePortableService.uploadFileServices(
        parseContent
      );
      const contentMessage = `The File has been Uploaded, QR Code is Also Generated`;
      sendSuccessResponse(res, apiResponse, contentMessage);
    } catch (err) {
      if (err instanceof z.ZodError) {
        scannerLogger.error(
          `ValidationError: Error while validating the File Content, Validation Failed Count : ${err.issues.length}`
        );
        const mappedError = mapZodMessages(err.issues);
        sendErrorResponse(res, mappedError);
      }
      next(err);
    }
  }

  public async getS3BucketPathAndDownload(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const urlId = req.params.urlId;
      const apiResponse = await SharePortableService.downloadQrCodeData(urlId);
      res.download(apiResponse);
    } catch (err) {
      next(err);
    }
  }

  public async getQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const urlId = req.params.urlId;
      const apiResponse = await SharePortableService.getQrCode(urlId);
      const contentMessage = `The QR Code has been Generated`;
      res.send(
        `<img src="${apiResponse}" alt="QR Code"><p>Scan to download</p>`
      );
    } catch (err) {
      next(err);
    }
  }
}

export default new SharePortableController();
