interface RabbitQueueService {
  name: string;
  queue: string;
}

export const POST_RAW: RabbitQueueService = {
  name: 'POST_RAW_SERVICES',
  queue: 'post_raw_queue',
};
