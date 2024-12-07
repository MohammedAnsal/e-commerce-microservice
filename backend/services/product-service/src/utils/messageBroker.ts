import { Kafka, logLevel, Partitioners, Producer } from "kafkajs";
import IKafka from "../types/interface/IKafka";
import { TOPIC_TYPE, messageType, ProductEvent } from "../types/kafkaType";

const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "product-service";
const KAFKA_BROKERS = [process.env.KAFKA_BROKERS_1 || "kafka:29092"];

class MessageBroker implements IKafka {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS,
      logLevel: logLevel.INFO, 
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });

    this.connectProducer(); //  Connection
  }

  private async connectProducer(): Promise<void> {
    //  Connection
    try {
      await this.producer.connect();
      console.log("Kafka producer connected successfully.");
    } catch (error) {
      console.error("Failed to connect Kafka producer:", error);
    }
  }

  async publish(
    topic: TOPIC_TYPE,
    message: messageType,
    event: ProductEvent
  ): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message), key: event }],
    });
  }

  async subscribe(
    topic: TOPIC_TYPE,
    groupId: string,
    messageHandler: Function
  ): Promise<void> {
    try {
    } catch (error) {}
  }
}

export default MessageBroker;
