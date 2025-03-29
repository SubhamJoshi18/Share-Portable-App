const createZipQueueConfig = () => {
  return {
    queueName: "share-portable: createZipQueue",
    queueExchange: "share-portable: createZipQueueExchange",
    queueRoutingKey: "share-portable: createZipQueueRk",
  };
};

const createQRCodeQueueConfig = () => {
  return {
    queueName: "share-portable: createQRCodeQueue",
    queueExchange: "share-portable: createQRCodeQueueExchange",
    queueRoutingKey: "share-portable: createQRCodeQueueRk",
  };
};

export { createZipQueueConfig, createQRCodeQueueConfig };
