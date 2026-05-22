import { app } from './app.js';
import { env } from './config/env.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { initializeRedisStore } from './services/bootstrapService.js';
import { logger } from './utils/logger.js';

let server;

async function bootstrap() {
  await connectRedis();
  await initializeRedisStore();

  server = app.listen(env.PORT, () => {
    logger.info({
      event: 'server_started',
      port: env.PORT,
      nodeEnv: env.NODE_ENV
    });
  });
}

async function shutdown(signal) {
  logger.info({ event: 'shutdown_started', signal });

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await disconnectRedis();
  logger.info({ event: 'shutdown_completed' });
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM').finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  shutdown('SIGINT').finally(() => process.exit(0));
});

bootstrap().catch((error) => {
  logger.error({
    event: 'startup_failed',
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});
