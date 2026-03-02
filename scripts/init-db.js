import Database from 'better-sqlite3';
import { hashSync } from 'bcryptjs';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    direction TEXT DEFAULT '',
    group_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    residence TEXT DEFAULT '',
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'coordinator',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    participant_limit INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    reject_reason TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, event_id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK(score >= 1 AND score <= 10),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, event_id)
  );

  CREATE TABLE IF NOT EXISTS feedback_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS feedback_fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL REFERENCES feedback_templates(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'string',
    required INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS feedback_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    field_id INTEGER NOT NULL REFERENCES feedback_fields(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    value TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, field_id, event_id)
  );
`);

// Seed admin user if not exists
const existing = db.prepare('SELECT id FROM users WHERE login = ?').get('admin');
if (!existing) {
  const hash = hashSync('admin', 10);
  db.prepare(`
    INSERT INTO users (full_name, login, password_hash, role)
    VALUES (?, ?, ?, ?)
  `).run('Администратор', 'admin', hash, 'admin');
  console.log('Admin user created: login=admin, password=admin');
} else {
  console.log('Admin user already exists, skipping seed.');
}

console.log('Database initialized successfully at:', dbPath);
db.close();
