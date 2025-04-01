import { Router } from "express";
import multer from "multer";
import { storage } from "../config/multer.config";
import SharePortableController from "../controller/share-portable.controller";

const sharePortableRouter = Router();
const upload = multer({ storage: storage });

sharePortableRouter.post(
  "/upload-file",
  upload.single("file"),
  SharePortableController.uploadFileController
);

sharePortableRouter.get(
  "/get-qr-code/:urlId",
  SharePortableController.getQRCode
);

sharePortableRouter.get(
  "/download-qr-code/:urlId",
  SharePortableController.getS3BucketPathAndDownload
);

sharePortableRouter.post(
  "/upload-multiple-file",
  upload.array("file"),
  SharePortableController.uploadmultipleFileController
);

export default sharePortableRouter;
