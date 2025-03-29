import {
  FILE_UPLOAD,
  FILE_LOADED,
  FILE_PROCESS,
  FILE_COPIED,
  FILE_PUSH_TO_ZIPCONSUMER,
  FILE_PUSH_TO_QRCODE_CONSUMER,
  FILE_QRCODE_CREATED,
} from "../constants/file.constant";

interface IFileCreate {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype?: string;
  filename: string;
  path: string;
  size: number;
  urlId?: string;
}

enum IFileStatus {
  upload = FILE_UPLOAD,
  process = FILE_PROCESS,
  load = FILE_LOADED,
  copied = FILE_COPIED,
  push_to_zip = FILE_PUSH_TO_ZIPCONSUMER,
  push_to_qrCode = FILE_PUSH_TO_QRCODE_CONSUMER,
  qrcode_created = FILE_QRCODE_CREATED,
}

interface ICreateZipPayload {
  urlId: string;
  filePath: string;
  fileType: string;
}

interface ICreateQRCodePayload extends ICreateZipPayload {
  isZipFile: true;
}

export { IFileCreate, IFileStatus, ICreateZipPayload, ICreateQRCodePayload };
