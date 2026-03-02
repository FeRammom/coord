import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Add options column to feedback_fields if not exists
try {
  db.exec(`ALTER TABLE feedback_fields ADD COLUMN options TEXT DEFAULT ''`);
  console.log('Added options column to feedback_fields');
} catch (e) {
  console.log('options column already exists in feedback_fields');
}

// Add comment column to ratings if not exists  
try {
  db.exec(`ALTER TABLE ratings ADD COLUMN comment TEXT DEFAULT ''`);
  console.log('Added comment column to ratings');
} catch (e) {
  console.log('comment column already exists in ratings');
}

// Add reject_reason column to applications if not exists
try {
  db.exec(`ALTER TABLE applications ADD COLUMN reject_reason TEXT DEFAULT ''`);
  console.log('Added reject_reason column to applications');
} catch (e) {
  console.log('reject_reason column already exists in applications');
}

console.log('Migration 001 complete');
db.close();
