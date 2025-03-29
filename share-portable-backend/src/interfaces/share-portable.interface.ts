import {
  FILE_UPLOAD,
  FILE_LOADED,
  FILE_PROCESS,
} from "../constants/file.constant";

interface IFileCreate {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype?: string;
  filename: string;
  path: string;
  size: number;
}

enum IFileStatus {
  upload = FILE_UPLOAD,
  process = FILE_PROCESS,
  load = FILE_LOADED,
}

export { IFileCreate, IFileStatus };
