import { redis } from '../utils/session.ts';

Deno.test('redis connection', async () => {
  await redis.ping();
});
