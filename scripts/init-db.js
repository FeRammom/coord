import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { join } from 'path';

const { hashSync } = bcrypt;

const dbPath = join(process.cwd(), 'database.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'coordinator',
    full_name TEXT NOT NULL,
    email TEXT DEFAULT NULL,
    phone TEXT DEFAULT NULL,
    organization TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    event_date TEXT DEFAULT NULL,
    location TEXT DEFAULT NULL,
    max_coordinators INTEGER DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'planned',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    comment TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, event_id)
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK(score >= 1 AND score <= 10),
    comment TEXT DEFAULT NULL,
    rated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, event_id)
  );

  CREATE TABLE IF NOT EXISTS feedback_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS feedback_fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL REFERENCES feedback_templates(id) ON DELETE CASCADE,
    field_type TEXT NOT NULL DEFAULT 'text',
    label TEXT NOT NULL,
    options TEXT DEFAULT NULL,
    is_required INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS feedback_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL REFERENCES feedback_templates(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(template_id, user_id)
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
