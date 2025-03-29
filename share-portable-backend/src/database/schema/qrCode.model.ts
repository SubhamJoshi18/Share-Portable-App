import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  qrCodeDataUrl: {
    type: String,
    required: [true, "QR Code Data Url is Required"],
  },

  urlId: {
    type: String,
    required: [true, "URL ID is Required"],
  },

  S3BucketFilePath: {
    type: String,
    required: [true, "S3Bucket File Path is Required"],
  },
});

const QRCodeModel = mongoose.model("QRCode Model", qrCodeSchema);
export default QRCodeModel;
