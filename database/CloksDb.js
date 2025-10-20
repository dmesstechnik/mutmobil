// src/db/database.js
import { openDatabaseSync } from "expo-sqlite";

// Lazy database initialization - don't open at module level to prevent iOS TurboModule crash
let db = null;
const getDatabase = () => {
  if (!db) {
    try {
      db = openDatabaseSync("mt-app.db");
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return db;
};

// ---- Table Management ----
export const dropClocksTable = () => {
  try {
    const database = getDatabase();
    database.runSync("DROP TABLE IF EXISTS clocks");
    console.log('✅ Table "clocks" dropped');
  } catch (err) {
    console.error("❌ Drop table error:", err.message);
  }
};

export const createClocksTable = () => {
  try {
    const database = getDatabase();
    database.runSync(`
      CREATE TABLE IF NOT EXISTS clocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clockIn TEXT,
        startBreakfast TEXT,
        endBreakfast TEXT,
        clockOut TEXT,
        startBreak1 TEXT,
        endBreak1 TEXT,
        startBreak2 TEXT,
        endBreak2 TEXT,
        clock_date TEXT,
        transfered BOOLEAN,
        user TEXT
      )
    `);
    console.log('✅ Table "clocks" created');
  } catch (err) {
    console.error("❌ Create table error:", err.message);
  }
};

export const createAppConfigTable = () => {
  try {
    const database = getDatabase();
    database.runSync(`
      CREATE TABLE IF NOT EXISTS app_config (
        key TEXT NOT NULL,
        value TEXT,
        userid INTEGER,
        PRIMARY KEY (key, userid)
      )
    `);
    console.log('✅ Table "app_config" created');
  } catch (err) {
    console.error("❌ Create app_config table error:", err.message);
  }
};

// ---- Queries ----
export const getAppConfig = () => {
  try {
    const database = getDatabase();
    const rows = database.getAllSync(`SELECT * FROM app_config;`) || [];
    return rows;
  } catch (err) {
    console.error("❌ Fetch app_config error:", err.message);
    return [];
  }
};

export const saveAppConfig = (key, value, userId) => {
  try {
    const database = getDatabase();
    const existing = database.getFirstSync(
      `SELECT * FROM app_config WHERE key = ? AND userid = ?;`,
      [key, userId]
    );

    if (existing) {
      database.runSync(
        `UPDATE app_config SET value = ? WHERE key = ? AND userid = ?;`,
        [value, key, userId]
      );
      console.log(`🔄 AppConfig "${key}" updated`);
    } else {
      database.runSync(
        `INSERT INTO app_config (key, value, userid) VALUES (?, ?, ?);`,
        [key, value, userId]
      );
      console.log(`➕ AppConfig "${key}" inserted`);
    }
  } catch (err) {
    console.error("❌ Save app_config error:", err.message);
  }
};

export const getAllUsersFromClocks = () => {
  try {
    const database = getDatabase();
    const clocks = database.getAllSync(`SELECT * FROM clocks;`) || [];
    return clocks;
  } catch (err) {
    console.error("❌ Fetch clocks error:", err.message);
    return [];
  }
};

export const saveClockData = (times, date, userId) => {
  try {
    const database = getDatabase();
    const existing = database.getFirstSync(
      `SELECT * FROM clocks WHERE clock_date = ? AND user = ?;`,
      [date, userId]
    );

    if (existing) {
      database.runSync(
        `UPDATE clocks SET
          clockIn = COALESCE(?, clockIn),
          startBreakfast = COALESCE(?, startBreakfast),
          endBreakfast = COALESCE(?, endBreakfast),
          clockOut = COALESCE(?, clockOut),
          startBreak1 = COALESCE(?, startBreak1),
          endBreak1 = COALESCE(?, endBreak1),
          startBreak2 = COALESCE(?, startBreak2),
          endBreak2 = COALESCE(?, endBreak2)
        WHERE clock_date = ? AND user = ?;`,
        [
          times.clockIn, times.startBreakfast, times.endBreakfast, times.clockOut,
          times.startBreak1, times.endBreak1, times.startBreak2, times.endBreak2,
          date, userId
        ]
      );
      console.log("🔄 Clock data updated");
    } else {
      database.runSync(
        `INSERT INTO clocks
          (clockIn, startBreakfast, endBreakfast, clockOut, startBreak1, endBreak1, startBreak2, endBreak2, clock_date, user, transfered)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          times.clockIn, times.startBreakfast, times.endBreakfast, times.clockOut,
          times.startBreak1, times.endBreak1, times.startBreak2, times.endBreak2,
          date, userId, times.transfered || 0
        ]
      );
      console.log("➕ Clock data inserted");
    }
  } catch (err) {
    console.error("❌ Save clock data error:", err.message);
  }
};

export const truncateClocksTable = () => {
  try {
    const database = getDatabase();
    database.runSync(`DELETE FROM clocks`);
    console.log("🗑️ Clocks table truncated");
  } catch (err) {
    console.error("❌ Truncate clocks error:", err.message);
  }
};
