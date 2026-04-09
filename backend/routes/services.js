const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../models/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ============ SAVINGS GOALS ============
router.get('/goals', authMiddleware, async (req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  if (!result.length) return res.json([]);
  const goals = result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
  res.json(goals);
});

router.post('/goals', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { name, targetAmount, icon = '🎯', color = '#6366f1', autoRoundup = false } = req.body;
  const id = uuidv4();
  db.run("INSERT INTO savings_goals (id, user_id, name, target_amount, icon, color, auto_roundup) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id, req.user.id, name, targetAmount, icon, color, autoRoundup ? 1 : 0]);
  saveDb();
  res.status(201).json({ id, name, target_amount: targetAmount, current_amount: 0, icon, color });
});

router.post('/goals/:id/deposit', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { amount } = req.body;
  const result = db.exec("SELECT * FROM savings_goals WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!result.length || !result[0].values.length) return res.status(404).json({ error: 'Goal not found' });

  const cols = result[0].columns;
  const goal = {};
  cols.forEach((c, i) => goal[c] = result[0].values[0][i]);

  const newAmount = Math.round((goal.current_amount + amount) * 100) / 100;
  db.run("UPDATE savings_goals SET current_amount = ? WHERE id = ?", [newAmount, req.params.id]);

  if (newAmount >= goal.target_amount) {
    db.run("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)",
      [uuidv4(), req.user.id, 'Goal Reached! 🎉', `You've reached your "${goal.name}" savings goal!`, 'success']);
  }
  saveDb();
  res.json({ current_amount: newAmount });
});

router.delete('/goals/:id', authMiddleware, async (req, res) => {
  const db = await getDb();
  db.run("DELETE FROM savings_goals WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
  saveDb();
  res.json({ deleted: true });
});

// ============ NOTIFICATIONS ============
router.get('/notifications', authMiddleware, async (req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [req.user.id]);
  if (!result.length) return res.json([]);
  const notifs = result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
  res.json(notifs);
});

router.post('/notifications/read', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { ids } = req.body;
  if (ids && ids.length) {
    const placeholders = ids.map(() => '?').join(',');
    db.run(`UPDATE notifications SET read = 1 WHERE id IN (${placeholders}) AND user_id = ?`, [...ids, req.user.id]);
  } else {
    db.run("UPDATE notifications SET read = 1 WHERE user_id = ?", [req.user.id]);
  }
  saveDb();
  res.json({ success: true });
});

// ============ FX RATES ============
router.get('/fx/rates', authMiddleware, async (req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM fx_rates");
  if (!result.length) return res.json([]);
  const rates = result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
  res.json(rates);
});

router.post('/fx/convert', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { fromCurrency, toCurrency, amount } = req.body;
  const result = db.exec("SELECT rate FROM fx_rates WHERE from_currency = ? AND to_currency = ?", [fromCurrency, toCurrency]);
  if (!result.length || !result[0].values.length) return res.status(400).json({ error: 'Rate not found' });
  const rate = result[0].values[0][0];
  const converted = Math.round(amount * rate * 100) / 100;
  res.json({ fromCurrency, toCurrency, amount, rate, converted });
});

// ============ BENEFICIARIES ============
router.get('/beneficiaries', authMiddleware, async (req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM beneficiaries WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
  if (!result.length) return res.json([]);
  const bens = result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
  res.json(bens);
});

router.post('/beneficiaries', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { name, accountNumber, bankName = 'ScalerBank', nickname } = req.body;
  const id = uuidv4();
  db.run("INSERT INTO beneficiaries (id, user_id, name, account_number, bank_name, nickname) VALUES (?, ?, ?, ?, ?, ?)",
    [id, req.user.id, name, accountNumber, bankName, nickname || name]);
  saveDb();
  res.status(201).json({ id, name, account_number: accountNumber });
});

// ============ AUDIT LOGS ============
router.get('/audit', authMiddleware, async (req, res) => {
  const db = await getDb();
  const result = db.exec("SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100", [req.user.id]);
  if (!result.length) return res.json([]);
  const logs = result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
  res.json(logs);
});

module.exports = router;
