import path from "path";
import fs from "fs";
import scannerLogger from "../libs/logger";

class FileHelper {
  public async clearTheUploadFiles() {
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
}

export default FileHelper;
