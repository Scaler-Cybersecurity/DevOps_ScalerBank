const express = require('express');
const { getDb } = require('../models/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Spending by category (last 30 days)
router.get('/spending', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { days = 30 } = req.query;

  const accts = db.exec("SELECT id FROM accounts WHERE user_id = ?", [req.user.id]);
  if (!accts.length) return res.json([]);
  const accountIds = accts[0].values.map(r => r[0]);
  const placeholders = accountIds.map(() => '?').join(',');

  const result = db.exec(
    `SELECT category, SUM(amount) as total, COUNT(*) as count 
     FROM transactions 
     WHERE from_account_id IN (${placeholders}) 
       AND type = 'debit' 
       AND created_at >= datetime('now', '-${parseInt(days)} days')
     GROUP BY category 
     ORDER BY total DESC`,
    accountIds
  );

  if (!result.length) return res.json([]);
  const data = result[0].values.map(row => ({
    category: row[0],
    total: Math.round(row[1] * 100) / 100,
    count: row[2]
  }));
  res.json(data);
});

// Daily spending trend
router.get('/trend', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { days = 30 } = req.query;

  const accts = db.exec("SELECT id FROM accounts WHERE user_id = ?", [req.user.id]);
  if (!accts.length) return res.json([]);
  const accountIds = accts[0].values.map(r => r[0]);
  const placeholders = accountIds.map(() => '?').join(',');

  const result = db.exec(
    `SELECT DATE(created_at) as date, 
            SUM(CASE WHEN type='debit' THEN amount ELSE 0 END) as spent,
            SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) as received
     FROM transactions 
     WHERE (from_account_id IN (${placeholders}) OR to_account_id IN (${placeholders}))
       AND created_at >= datetime('now', '-${parseInt(days)} days')
     GROUP BY DATE(created_at) 
     ORDER BY date`,
    [...accountIds, ...accountIds]
  );

  if (!result.length) return res.json([]);
  const data = result[0].values.map(row => ({
    date: row[0],
    spent: Math.round(row[1] * 100) / 100,
    received: Math.round(row[2] * 100) / 100
  }));
  res.json(data);
});

// Monthly summary
router.get('/monthly', authMiddleware, async (req, res) => {
  const db = await getDb();
  const accts = db.exec("SELECT id FROM accounts WHERE user_id = ?", [req.user.id]);
  if (!accts.length) return res.json([]);
  const accountIds = accts[0].values.map(r => r[0]);
  const placeholders = accountIds.map(() => '?').join(',');

  const result = db.exec(
    `SELECT strftime('%Y-%m', created_at) as month,
            SUM(CASE WHEN type='debit' THEN amount ELSE 0 END) as spent,
            SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) as received
     FROM transactions 
     WHERE (from_account_id IN (${placeholders}) OR to_account_id IN (${placeholders}))
     GROUP BY strftime('%Y-%m', created_at)
     ORDER BY month DESC
     LIMIT 6`,
    [...accountIds, ...accountIds]
  );

  if (!result.length) return res.json([]);
  const data = result[0].values.map(row => ({
    month: row[0],
    spent: Math.round(row[1] * 100) / 100,
    received: Math.round(row[2] * 100) / 100
  }));
  res.json(data);
});

module.exports = router;
