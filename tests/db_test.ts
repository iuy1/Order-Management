// db_test.ts
import {
  pool,
} from '../utils/db.ts';

Deno.test('db connection', async () => {
  {
    using _client = await pool.connect();
  }
  await pool.end();
});
