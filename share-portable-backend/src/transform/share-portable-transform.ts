import {
  JPEG_MIME_TYPE,
  JSON_MIME_TYPE,
  WORD_MIME_TYPE,
} from "../constants/mime-type.constant";
import { handleJPEGMimeType } from "../handlers/jpeg-mime-type.handler";
import { handleJsonMimeType } from "../handlers/json-mime-type.handler";
import { handleWordDocument } from "../handlers/word-mime-type.handler";
import { IFileCreate } from "../interfaces/share-portable.interface";
import scannerLogger from "../libs/logger";

async function transformAndHandleMimeTypes(
  payload: IFileCreate,
  mimeType: string
) {
  return new Promise(async (resolve, reject) => {
    switch (mimeType) {
      case JSON_MIME_TYPE: {
        const result = await handleJsonMimeType(payload);
        resolve(result);
        break;
      }

      case JPEG_MIME_TYPE: {
        const result = await handleJPEGMimeType(payload);
        resolve(result);
        break;
      }

      case WORD_MIME_TYPE: {
        const result = await handleWordDocument(payload);
        resolve(result);
        break;
      }

      default: {
        scannerLogger.error(
          `${mimeType} Does not Supported on the System, Please Try Valid Mime Type `
        );
      }
    }
  });
}

export { transformAndHandleMimeTypes };
