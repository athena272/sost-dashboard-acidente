import 'reflect-metadata';
import * as path from 'path';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AccidentSource } from '@sost/shared';
import { AccidentSchema } from '../accidents/accident.schema';
import { defaultSpreadsheetPath, parseCatSpreadsheet } from './parse-spreadsheet';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

async function main() {
  const filePath = process.argv[2] ?? defaultSpreadsheetPath();
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sost-dashboard';

  console.log(`Reading spreadsheet: ${filePath}`);
  const { docs, skipped, errors } = await parseCatSpreadsheet(filePath);
  console.log(`Parsed ${docs.length} rows, skipped ${skipped}`);
  if (errors.length) {
    console.log('Parse errors:', errors.slice(0, 20));
  }

  await mongoose.connect(uri);
  const AccidentModel = mongoose.model('Accident', AccidentSchema);

  const replace = process.argv.includes('--replace');
  if (replace) {
    const deleted = await AccidentModel.deleteMany({ source: AccidentSource.Seed });
    console.log(`Removed ${deleted.deletedCount} previous seed records`);
  }

  const existing = await AccidentModel.countDocuments();
  if (existing > 0 && !replace) {
    console.log(
      `Database already has ${existing} accidents. Use --replace to re-seed seed records only.`,
    );
    await mongoose.disconnect();
    return;
  }

  let inserted = 0;
  let duplicates = 0;
  for (const doc of docs) {
    try {
      await AccidentModel.create(doc);
      inserted += 1;
    } catch (error) {
      const code = (error as { code?: number }).code;
      if (code === 11000) {
        duplicates += 1;
      } else {
        throw error;
      }
    }
  }

  console.log(`Inserted ${inserted}, duplicates skipped ${duplicates}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
