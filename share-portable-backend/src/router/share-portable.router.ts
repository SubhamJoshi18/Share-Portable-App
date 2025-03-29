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

export default sharePortableRouter;
