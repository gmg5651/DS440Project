import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('swiftulin.db');

// Manual table creation for demo purposes (auto-migrations)
sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS meal_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_name TEXT NOT NULL,
    carbs_g REAL NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS glucose_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    glucose_mg_dl REAL NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS dose_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_dose_units REAL NOT NULL,
    correction_dose_units REAL NOT NULL,
    total_units REAL NOT NULL,
    confirmed INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite, { schema });
