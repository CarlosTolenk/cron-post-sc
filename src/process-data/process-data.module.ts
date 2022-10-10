import { Module } from '@nestjs/common';
import { ProcessDataController } from './process-data.controller';

@Module({
  controllers: [ProcessDataController]
})
export class ProcessDataModule {}
