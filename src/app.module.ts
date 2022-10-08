import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task.service';
import { ScrapperModule } from './scrapper/scrapper.module';

@Module({
  imports: [ScheduleModule.forRoot(), ScrapperModule],
  controllers: [AppController],
  providers: [AppService, TasksService],
})
export class AppModule {}
