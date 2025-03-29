import createQRCodeConsumer from "../queues/consumers/createQrCodeQueue";
import createZipConsumer from "../queues/consumers/createZipQueue.consumer";

const consumerEnabled = {
  createZipQueue: createZipConsumer,
  createQRCodeQueue: createQRCodeConsumer,
};

export { consumerEnabled };
