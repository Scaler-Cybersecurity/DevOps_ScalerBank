const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../models/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get transactions for user
router.get('/', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { limit = 50, offset = 0, category, type } = req.query;
  
  // Get user's account IDs
  const accts = db.exec("SELECT id FROM accounts WHERE user_id = ?", [req.user.id]);
  if (!accts.length) return res.json([]);
  const accountIds = accts[0].values.map(r => r[0]);
  const placeholders = accountIds.map(() => '?').join(',');
  
  let query = `SELECT * FROM transactions WHERE (from_account_id IN (${placeholders}) OR to_account_id IN (${placeholders}))`;
  let params = [...accountIds, ...accountIds];
  
  if (category && category !== 'all') {
    query += ` AND category = ?`;
    params.push(category);
  }
  if (type && type !== 'all') {
    query += ` AND type = ?`;
    params.push(type);
  }
  
  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  
  const result = db.exec(query, params);
  if (!result.length) return res.json([]);
  
  const txns = result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
  res.json(txns);
});

// Create transfer (P2P) with double-entry ledger
router.post('/transfer', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const { fromAccountId, toAccountNumber, amount, description, category = 'transfer', idempotencyKey } = req.body;

    if (!fromAccountId || !toAccountNumber || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer details' });
    }

    // Idempotency check
    if (idempotencyKey) {
      const existing = db.exec("SELECT id FROM transactions WHERE idempotency_key = ?", [idempotencyKey]);
      if (existing.length && existing[0].values.length) {
        return res.status(200).json({ message: 'Duplicate request', transactionId: existing[0].values[0][0] });
      }
    }

    // Verify source account belongs to user
    const fromResult = db.exec("SELECT * FROM accounts WHERE id = ? AND user_id = ?", [fromAccountId, req.user.id]);
    if (!fromResult.length || !fromResult[0].values.length) {
      return res.status(404).json({ error: 'Source account not found' });
    }
    const fromCols = fromResult[0].columns;
    const fromAccount = {};
    fromCols.forEach((c, i) => fromAccount[c] = fromResult[0].values[0][i]);

    if (fromAccount.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Find target account
    const toResult = db.exec("SELECT * FROM accounts WHERE account_number = ?", [toAccountNumber]);
    if (!toResult.length || !toResult[0].values.length) {
      return res.status(404).json({ error: 'Destination account not found' });
    }
    const toCols = toResult[0].columns;
    const toAccount = {};
    toCols.forEach((c, i) => toAccount[c] = toResult[0].values[0][i]);

    // === SAGA: Execute transfer ===
    const txId = uuidv4();
    const idemKey = idempotencyKey || uuidv4();

    try {
      // Step 1: Debit source
      const newFromBalance = Math.round((fromAccount.balance - amount) * 100) / 100;
      db.run("UPDATE accounts SET balance = ? WHERE id = ?", [newFromBalance, fromAccountId]);
      
      // Step 2: Credit destination
      const newToBalance = Math.round((toAccount.balance + amount) * 100) / 100;
      db.run("UPDATE accounts SET balance = ? WHERE id = ?", [newToBalance, toAccount.id]);

      // Step 3: Double-entry ledger
      db.run("INSERT INTO ledger_entries (id, account_id, type, amount, reference_id, description, category, balance_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [uuidv4(), fromAccountId, 'DEBIT', amount, txId, description || 'Transfer Out', category, newFromBalance]);
      
      db.run("INSERT INTO ledger_entries (id, account_id, type, amount, reference_id, description, category, balance_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [uuidv4(), toAccount.id, 'CREDIT', amount, txId, description || 'Transfer In', category, newToBalance]);

      // Step 4: Transaction record
      db.run("INSERT INTO transactions (id, idempotency_key, from_account_id, to_account_id, amount, type, status, description, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [txId, idemKey, fromAccountId, toAccount.id, amount, 'debit', 'completed', description || 'P2P Transfer', category]);

      // Step 5: Notifications
      db.run("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)",
        [uuidv4(), req.user.id, 'Transfer Sent', `₹${amount} sent successfully.`, 'success']);
      
      if (toAccount.user_id) {
        db.run("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)",
          [uuidv4(), toAccount.user_id, 'Money Received', `₹${amount} received in your account.`, 'success']);
      }

      // Audit log
      db.run("INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [uuidv4(), req.user.id, 'TRANSFER', 'transaction', txId, JSON.stringify({ amount, from: fromAccountId, to: toAccount.id })]);

      saveDb();
      res.status(201).json({ transactionId: txId, status: 'completed', balance: newFromBalance });

    } catch (sagaError) {
      // COMPENSATING ACTION: Rollback
      db.run("UPDATE accounts SET balance = ? WHERE id = ?", [fromAccount.balance, fromAccountId]);
      db.run("UPDATE accounts SET balance = ? WHERE id = ?", [toAccount.balance, toAccount.id]);
      saveDb();
      throw sagaError;
    }

  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ error: 'Transfer failed' });
  }
});

// Bill payment
router.post('/bill-payment', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const { fromAccountId, billerName, amount, category = 'bills' } = req.body;

    const fromResult = db.exec("SELECT * FROM accounts WHERE id = ? AND user_id = ?", [fromAccountId, req.user.id]);
    if (!fromResult.length) return res.status(404).json({ error: 'Account not found' });
    
    const fromCols = fromResult[0].columns;
    const fromAccount = {};
    fromCols.forEach((c, i) => fromAccount[c] = fromResult[0].values[0][i]);

    if (fromAccount.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    const txId = uuidv4();
    const newBalance = Math.round((fromAccount.balance - amount) * 100) / 100;

    db.run("UPDATE accounts SET balance = ? WHERE id = ?", [newBalance, fromAccountId]);
    db.run("INSERT INTO ledger_entries (id, account_id, type, amount, reference_id, description, category, balance_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [uuidv4(), fromAccountId, 'DEBIT', amount, txId, `Bill: ${billerName}`, category, newBalance]);
    db.run("INSERT INTO transactions (id, from_account_id, amount, type, status, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [txId, fromAccountId, amount, 'debit', 'completed', `Bill Payment: ${billerName}`, category]);
    
    db.run("INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)",
      [uuidv4(), req.user.id, 'Bill Paid', `₹${amount} paid to ${billerName}.`, 'success']);

    saveDb();
    res.status(201).json({ transactionId: txId, balance: newBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment failed' });
  }
});

module.exports = router;
