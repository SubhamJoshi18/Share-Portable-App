import QRCodeModel from "../database/schema/qrCode.model";

class QRCodeRepsotiory {
  public async createQrCodeData(
    urlId: string,
    qrCodeDataUrl: string,
    zipFilePath: string
  ) {
    const savedResult = await QRCodeModel.create({
      urlId: urlId,
      qrCodeDataUrl: qrCodeDataUrl,
      S3BucketFilePath: zipFilePath,
    });
    return savedResult;
  }
}

export default QRCodeRepsotiory;
