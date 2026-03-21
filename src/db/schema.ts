import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const mealLogs = sqliteTable('meal_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    foodName: text('food_name').notNull(),
    carbsG: real('carbs_g').notNull(),
    createdAt: integer('created_at').notNull(),
});

export const glucoseLogs = sqliteTable('glucose_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    glucoseMgDl: real('glucose_mg_dl').notNull(),
    createdAt: integer('created_at').notNull(),
});

export const doseLogs = sqliteTable('dose_logs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    mealDoseUnits: real('meal_dose_units').notNull(),
    correctionDoseUnits: real('correction_dose_units').notNull(),
    totalUnits: real('total_units').notNull(),
    confirmed: integer('confirmed', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at').notNull(),
});
