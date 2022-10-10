import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { POST_RAW } from './common/interfaces/services.rabbit';
import { ProcessDataModule } from './process-data/process-data.module';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appProcess = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProcessDataModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: POST_RAW.queue,
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await appProcess.listen();
  await app.listen(3000);
}
bootstrap().then(() => console.log('App is running'));
