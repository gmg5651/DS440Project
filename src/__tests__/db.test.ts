import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mealLogs, glucoseLogs, doseLogs } from '@/db/schema';
import { sql } from 'drizzle-orm';

test('can insert and retrieve a meal log', async () => {
    const sqlite = new Database(':memory:');
    const db = drizzle(sqlite);

    db.run(sql`CREATE TABLE IF NOT EXISTS meal_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, food_name TEXT NOT NULL, carbs_g REAL NOT NULL, created_at INTEGER NOT NULL)`);

    await db.insert(mealLogs).values({ foodName: 'Pizza', carbsG: 52, createdAt: Date.now() });
    const rows = await db.select().from(mealLogs);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].foodName).toBe('Pizza');
    sqlite.close();
});
