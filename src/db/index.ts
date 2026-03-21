import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { Platform } from 'react-native';
import * as schema from './schema';

let dbInstance: any;

if (Platform.OS === 'web') {
    const mockQuery = () => ({
        from: () => ({
            where: () => Promise.resolve([]),
            limit: () => Promise.resolve([]),
            orderBy: () => Promise.resolve([]),
            then: (cb: any) => Promise.resolve([]).then(cb),
        }),
        values: () => Promise.resolve(),
        set: () => ({ where: () => Promise.resolve() }),
        where: () => Promise.resolve([]),
    });

    dbInstance = {
        select: mockQuery,
        insert: mockQuery,
        update: mockQuery,
        delete: mockQuery,
    };
} else {
    const sqlite = SQLite.openDatabaseSync('swiftulin.db');
    dbInstance = drizzle(sqlite, { schema });
}

export const db = dbInstance;
