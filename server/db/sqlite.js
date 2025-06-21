const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      name TEXT,
      dosage TEXT,
      frequency TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS medication_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicationId INTEGER,
      date TEXT,
      taken INTEGER DEFAULT 0,
      FOREIGN KEY(medicationId) REFERENCES medications(id)
    );
  `);
});

module.exports = db;
