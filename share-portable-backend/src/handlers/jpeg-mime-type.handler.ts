import { IFileCreate } from "../interfaces/share-portable.interface";
import scannerLogger from "../libs/logger";

async function handleJPEGMimeType(payload: IFileCreate, isJpeg = true) {
  scannerLogger.info(
    `JPEG Handler Extracting and Uploading File and Creating QR Code`
  );
}

export { handleJPEGMimeType };
