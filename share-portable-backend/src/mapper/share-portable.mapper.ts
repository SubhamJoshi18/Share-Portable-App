import { IFileCreate } from "../interfaces/share-portable.interface";
import { createFileSchema } from "../validation/share-portable.validation";

function mapZodMessages(errData: Array<any>) {
  const errMessageData = errData.map((err) => {
    return {
      message: err.message,
      code: err.code,
      field: err.path[0],
    };
  });
  return errMessageData;
}

async function mapZodArrayMessage(payload: IFileCreate[]) {
  const sucessPayload = [];
  const failedPayload = [];
  for (const item of payload) {
    const parsePayload = await createFileSchema.parse(item);
    if (!parsePayload) {
      failedPayload.push(item);
    } else {
      sucessPayload.push(item);
    }
  }
  return {
    sucessPayload,
    failedPayload,
  };
}

export { mapZodMessages , mapZodArrayMessage};
