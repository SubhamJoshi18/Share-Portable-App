import path from "path";
import fs from "fs";
import scannerLogger from "../libs/logger";
import { url } from "inspector";

class FileHelper {
  public async clearTheUploadFiles(): Promise<void> {
    try {
      const baseDir = path.join(process.cwd(), "Uploads");
      if (fs.existsSync(baseDir)) {
        fs.readdirSync(baseDir).forEach(async (file, index) => {
          const currentPath = path.join(baseDir, file);
          if (fs.lstatSync(currentPath).isDirectory()) {
            await this.clearTheUploadFiles();
          } else {
            fs.unlinkSync(currentPath);
          }
        });
      }
      scannerLogger.info(
        `FileHelper: Directory : ${baseDir} Has been Cleared Successfully`
      );
    } catch (err) {
      scannerLogger.error(
        `FileHelper: Error while clearing the Upload Directory`
      );
      throw err;
    }
  }

  public async getS3BucketPath(): Promise<string> {
    return path.join(process.cwd(), "S3Bucket");
  }

  public async getObjectBasedOnMimeType(objectKey: string, urlId: string) {
    const s3BucketPath = await this.getS3BucketPath();
    return path.join(s3BucketPath, objectKey, urlId);
  }

  public async uploadToWordObject(urlId: string, uploadedPath: string) {
    const wordBaseDir = path.join(process.cwd(), "S3Bucket", "WORD", urlId);

    if (!fs.existsSync(wordBaseDir)) {
      scannerLogger.info(`${wordBaseDir} Object Has been Created`);
      fs.mkdirSync(wordBaseDir, { recursive: true });
    }

    scannerLogger.info(`${wordBaseDir} Is Created`);

    const isValidDirectory = fs.lstatSync(wordBaseDir).isDirectory();

    const [filePath, uploadPath] = uploadedPath.split("uploads");

    if (isValidDirectory) {
      const copyStatus = fs.copyFileSync(
        uploadedPath,
        path.join(wordBaseDir, uploadPath)
      );

      scannerLogger.info(
        `The Source File :${uploadedPath} Has been Copied Successfully to S3Bucket : ${path.join(
          wordBaseDir,
          uploadPath
        )}`
      );
      return {
        status: true,
        path: path.join(wordBaseDir, uploadPath),
      };
    } else {
      scannerLogger.error(`The ${wordBaseDir} is not Valid Directory`);
      return {
        status: false,
        path: "",
      };
    }
  }

  public async uploadToJPEGObject(urlId: string, uploadedPath: string) {
    const jsonBaseDir = path.join(process.cwd(), "S3Bucket", "JPEG", urlId);

    if (!fs.existsSync(jsonBaseDir)) {
      scannerLogger.info(`${jsonBaseDir} Object Has been Created`);
      fs.mkdirSync(jsonBaseDir, { recursive: true });
    }

    scannerLogger.info(`${jsonBaseDir} Is Created`);

    const isValidDirectory = fs.lstatSync(jsonBaseDir).isDirectory();

    const [filePath, uploadPath] = uploadedPath.split("uploads");

    if (isValidDirectory) {
      const copyStatus = fs.copyFileSync(
        uploadedPath,
        path.join(jsonBaseDir, uploadPath)
      );
      scannerLogger.info(
        `The Source File : ${uploadedPath} Has been Copied Successfully to S3Bucket : ${path.join(
          jsonBaseDir,
          uploadPath
        )}`
      );

      return {
        status: true,
        path: path.join(jsonBaseDir, uploadPath),
      };
    } else {
      scannerLogger.error(`The ${jsonBaseDir} is not Valid Directory`);
      return {
        status: false,
        path: "",
      };
    }
  }

  public async listAllFiles(path: string) {
    return fs.readdirSync(path);
  }

  public async createZipFileBasedOnUrlId(
    mimeType: string,
    urlId: string
  ): Promise<string> {
    const zipBaseUrl = path.join(
      process.cwd(),
      "ZipFiles",
      mimeType.toUpperCase()
    );
    const zipDir = path.join(zipBaseUrl, urlId);
    const zipFilePath = path.join(zipDir, "payload.zip");

    if (!fs.existsSync(zipDir)) {
      scannerLogger.info(`Zip Directory Does not Exist, Creating it`);
      fs.mkdirSync(zipDir, { recursive: true });
    }

    return zipFilePath;
  }
}

export default FileHelper;
