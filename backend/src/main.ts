import 'reflect-metadata';

import * as path from 'path';
import * as dotenv from 'dotenv';
import { createNestApp } from './create-app';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

async function bootstrap() {
  const app = await createNestApp();
  const port = process.env.API_PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
