import { IFileCreate } from "../interfaces/share-portable.interface";
import scannerLogger from "../libs/logger";

async function handleJsonMimeType(payload: IFileCreate, isJson = true) {
  scannerLogger.info(
    `Json Handler Extracting and Uploading File and Creating QR Code`
  );
}

export {
    handleJsonMimeType
}
