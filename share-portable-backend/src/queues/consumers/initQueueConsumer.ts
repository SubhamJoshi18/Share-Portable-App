import { Channel } from "amqplib";
import { consumerEnabled } from "../../config/consumer.config";

const queueConsumer: ((channel: Channel) => Promise<void>)[] = [];

async function initQueueConsumer(channel: Channel) {
  const clearElementConsuemr =
    queueConsumer.length > 0
      ? queueConsumer.splice(0, queueConsumer.length)
      : [];

  for (const [key, value] of Object.entries(consumerEnabled)) {
    if (typeof value === "function") {
      queueConsumer.push(value);
    }
  }

  queueConsumer.map(async (data: Function) => {
    await data(channel);
  });
}

export default initQueueConsumer;
