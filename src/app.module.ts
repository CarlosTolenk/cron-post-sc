import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task.service';
import { ScrapperModule } from './scrapper/scrapper.module';

@Module({
  imports: [ScheduleModule.forRoot(), ScrapperModule],
  providers: [TasksService],
})
export class AppModule {}
