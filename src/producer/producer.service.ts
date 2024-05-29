import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;
  constructor() {
    const connection = amqp.connect(['amqp://localhost:15672']);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue('eventQueue', { durable: true });
      },
    });
  }

  async addToEventQueue(event: any) {
    try {
      await this.channelWrapper.sendToQueue(
        'eventQueue',
        Buffer.from(JSON.stringify(event)),
        {
          persistent: true,
        },
      );
      Logger.log('Sent To Queue');
    } catch (error) {
      throw new HttpException(
        'Error adding event to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
