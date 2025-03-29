import path from "path";
import fs from "fs";
import scannerLogger from "../libs/logger";

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

  public async uploadToJPEGObject(uploadedPath: string) {
    const jsonBaseDir = path.join(process.cwd(), "S3Bucket", "JPEG");

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
}

export default FileHelper;
