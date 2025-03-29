import UrlModel from "../database/schema/url.model";
import { IFileStatus } from "../interfaces/share-portable.interface";

class UrlRepository {
  public async changeStatus(urlId: string, status: IFileStatus) {
    const savedResult = await UrlModel.updateOne(
      {
        urlId: urlId,
      },
      {
        status: status,
      },
      { $new: true }
    );
    return savedResult;
  }

  public async findUrlId(urlId: string) {
    const result = await UrlModel.findOne({
      urlId: urlId,
    });
    return result;
  }

  public async createResult(urlId: string) {
    const createResult = await UrlModel.create({
      urlId: urlId,
    });
    return createResult;
  }
}

export { UrlRepository };
