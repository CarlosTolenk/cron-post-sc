import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { POST_RAW } from '../common/interfaces';

@Controller()
export class ProcessDataController {
  @EventPattern(POST_RAW.queue)
  async handleBookCreatedEvent(data: Record<string, unknown>) {
    console.log(data);
  }
}
