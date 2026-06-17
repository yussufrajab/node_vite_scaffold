import Bull from 'bull';
import { env } from '../config/index.js';
import { clearExpiredRefreshTokens } from '../services/auth.service.js';

const cleanupQueue = new Bull('cleanup', {
  redis: { host: env.redis.host, port: env.redis.port },
});

cleanupQueue.process(async () => {
  const cleared = clearExpiredRefreshTokens();
  console.log(`Cleanup job: cleared ${cleared} expired refresh tokens`);
});

export function startCleanupJob(): void {
  cleanupQueue.add({}, { repeat: { every: 3600 * 1000 } });
  console.log('Cleanup job scheduled (every hour)');
}

export { cleanupQueue };
