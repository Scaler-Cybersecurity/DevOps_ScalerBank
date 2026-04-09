const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', 'scalerbank.db');
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  initTables(db);
  seedData(db);
  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(path.join(__dirname, '..', 'scalerbank.db'), buffer);
}

function initTables(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      avatar_color TEXT DEFAULT '#1a5c3a',
      kyc_status TEXT DEFAULT 'pending',
      kyc_aadhaar TEXT,
      kyc_pan TEXT,
      mfa_enabled INTEGER DEFAULT 0,
      mfa_secret TEXT,
      role TEXT DEFAULT 'customer',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_number TEXT UNIQUE NOT NULL,
      account_type TEXT NOT NULL DEFAULT 'savings',
      currency TEXT DEFAULT 'INR',
      balance REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('DEBIT', 'CREDIT')),
      amount REAL NOT NULL,
      reference_id TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'other',
      balance_after REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT UNIQUE,
      from_account_id TEXT,
      to_account_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      type TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      description TEXT,
      category TEXT DEFAULT 'other',
      scheduled_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (from_account_id) REFERENCES accounts(id),
      FOREIGN KEY (to_account_id) REFERENCES accounts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      icon TEXT DEFAULT '🎯',
      color TEXT DEFAULT '#1a5c3a',
      auto_roundup INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS beneficiaries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      bank_name TEXT DEFAULT 'ScalerBank',
      nickname TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS fx_rates (
      id TEXT PRIMARY KEY,
      from_currency TEXT NOT NULL,
      to_currency TEXT NOT NULL,
      rate REAL NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS scheduled_payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      from_account_id TEXT NOT NULL,
      to_account_id TEXT,
      to_account_number TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      frequency TEXT DEFAULT 'once',
      next_run TEXT,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

function seedData(db) {
  // Seed FX rates if empty
  const count = db.exec("SELECT COUNT(*) as c FROM fx_rates");
  if (count[0] && count[0].values[0][0] === 0) {
    const rates = [
      ['INR', 'USD', 0.012], ['USD', 'INR', 83.5],
      ['INR', 'EUR', 0.011], ['EUR', 'INR', 90.2],
      ['INR', 'GBP', 0.0095], ['GBP', 'INR', 105.3],
      ['USD', 'EUR', 0.92], ['EUR', 'USD', 1.09],
      ['USD', 'GBP', 0.79], ['GBP', 'USD', 1.27],
    ];
    const stmt = db.prepare("INSERT INTO fx_rates (id, from_currency, to_currency, rate) VALUES (?, ?, ?, ?)");
    rates.forEach(([from, to, rate], i) => {
      stmt.run([`fx_${i}`, from, to, rate]);
    });
    stmt.free();
  }
}

module.exports = { getDb, saveDb };
