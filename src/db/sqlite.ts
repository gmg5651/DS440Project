// Persist to local storage for web demo
const STORAGE_KEY = 'swiftulin_db_v2';
const isWeb = typeof window !== 'undefined';

const getStore = () => {
    try {
        if (isWeb) {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) return JSON.parse(data);
        }
        return (global as any).__SWIFTULIN_STORE__ || { meal_logs: [], glucose_logs: [], dose_logs: [] };
    } catch {
        return { meal_logs: [], glucose_logs: [], dose_logs: [] };
    }
};

const saveStore = (store: any) => {
    try {
        if (isWeb) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
        }
        (global as any).__SWIFTULIN_STORE__ = store;
    } catch (e) {
        console.warn('DB Save Failed', e);
    }
};

function getTableName(tableObj: any): string {
    const symbol = Symbol.for('drizzle:Name');
    const name = tableObj?.[symbol] || tableObj?._?.name || (typeof tableObj === 'string' ? tableObj : 'unknown');
    // Normalize names because Drizzle sometimes uses camelCase symbols
    if (name.includes('meal')) return 'meal_logs';
    if (name.includes('glucose')) return 'glucose_logs';
    if (name.includes('dose')) return 'dose_logs';
    return name;
}

export const db: any = {
    select: (fields?: any) => ({
        from: (table: any) => {
            const tableName = getTableName(table);
            const store = getStore();
            const data = [...(store[tableName] || [])];

            const obj = {
                where: (condition: any) => {
                    let filtered = [...data];
                    if (condition?.operator === '>=' || condition?.operator === 'gte') {
                        const threshold = condition.right;
                        filtered = filtered.filter(item => (item.createdAt || item.created_at) >= threshold);
                    }
                    else if (condition?.left?.name === 'id' || condition?.operator === '=') {
                        const id = condition.right;
                        filtered = filtered.filter(item => item.id == id);
                    }
                    return Promise.resolve(filtered);
                },
                orderBy: () => obj,
                limit: () => obj,
                then: (onfulfilled: any) => Promise.resolve(data).then(onfulfilled)
            };
            return obj as any;
        }
    }),
    insert: (table: any) => ({
        values: (itemOrArray: any) => {
            const tableName = getTableName(table);
            const store = getStore();
            if (!store[tableName]) store[tableName] = [];

            const itemsToAdd = Array.isArray(itemOrArray) ? itemOrArray : [itemOrArray];
            itemsToAdd.forEach(item => {
                store[tableName].push({
                    ...item,
                    id: Math.random().toString(36).substr(2, 9),
                    createdAt: item.createdAt || Date.now(),
                    created_at: item.createdAt || Date.now() // Support both
                });
            });

            saveStore(store);
            console.log(`[DB INSERT SUCCESS] ${tableName}:`, itemsToAdd);
            return Promise.resolve();
        }
    }),
    update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    delete: (table: any) => ({
        where: (condition: any) => {
            const tableName = getTableName(table);
            const store = getStore();
            if (condition?.right) {
                store[tableName] = (store[tableName] || []).filter((item: any) => item.id !== condition.right);
            } else {
                store[tableName] = [];
            }
            saveStore(store);
            console.log(`[DB DELETE] ${tableName}`);
            return Promise.resolve();
        }
    }),
};
