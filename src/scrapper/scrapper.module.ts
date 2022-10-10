import { Module } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';
import { ScrapperController } from './scrapper.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { POST_RAW } from '../common/interfaces';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: POST_RAW.name,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: POST_RAW.queue,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [ScrapperService],
  controllers: [ScrapperController],
})
export class ScrapperModule {}
