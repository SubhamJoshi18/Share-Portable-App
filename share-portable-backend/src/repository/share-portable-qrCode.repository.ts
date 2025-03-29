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

  public async findUrlIdInQRCode(urlId: string) {
    const result = await QRCodeModel.findOne({
      urlId: urlId,
    });
    return result;
  }
}

export default QRCodeRepsotiory;
