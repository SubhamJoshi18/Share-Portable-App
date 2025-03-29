import {
  FILE_UPLOAD,
  FILE_LOADED,
  FILE_PROCESS,
  FILE_COPIED,
  FILE_PUSH_TO_ZIPCONSUMER,
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
}

interface ICreateZipPayload {
  urlId: string;
  filePath: string;
}

export { IFileCreate, IFileStatus, ICreateZipPayload };
