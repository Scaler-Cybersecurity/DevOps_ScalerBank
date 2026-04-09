import { useState, useEffect } from "react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { fmt, fmtDate, fmtDateTime, CATEGORY_ICONS, PIE_COLORS } from "../utils/constants";

export default function Dashboard() {
  const { apiFetch } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [spending, setSpending] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    apiFetch("/accounts").then(r => r.json()).then(setAccounts);
    apiFetch("/transactions?limit=8").then(r => r.json()).then(setTransactions);
    apiFetch("/analytics/spending?days=30").then(r => r.json()).then(setSpending);
    apiFetch("/analytics/trend?days=14").then(r => r.json()).then(setTrend);
  }, [apiFetch]);

  const totalBalance = accounts.reduce(
    (s, a) => s + (a.currency === "INR" ? a.balance : a.balance * 83.5), 0
  );
  const totalSpent = spending.reduce((s, c) => s + c.total, 0);

  return (
    <div className="page-content">
      <div className="balance-hero">
        <div className="balance-label">Total Balance</div>
        <div className="balance-amount">{fmt(totalBalance)}</div>
        <div className="balance-sub">
          {accounts.length} account{accounts.length !== 1 ? "s" : ""} · {fmt(totalSpent)} spent this month
        </div>
      </div>

      <div className="cards-row">
        {accounts.map(a => (
          <div key={a.id} className="account-card"
            style={{ borderLeft: `3px solid ${a.currency === "INR" ? "#1a5c3a" : "#c4841d"}` }}>
            <div className="ac-currency">{a.currency}</div>
            <div className="ac-balance">{fmt(a.balance, a.currency)}</div>
            <div className="ac-number">{a.account_number}</div>
            <div className="ac-type">{a.account_type}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Spending Trend (14 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="gSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a5c3a" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1a5c3a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#8a8a8a", fontSize: 11 }} tickFormatter={fmtDate} />
              <YAxis tick={{ fill: "#8a8a8a", fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, color: "#1e1e1e" }}
                formatter={(v) => [fmt(v), ""]} labelFormatter={fmtDate}
              />
              <Area type="monotone" dataKey="spent" stroke="#1a5c3a" fill="url(#gSpent)" strokeWidth={2} />
              <Area type="monotone" dataKey="received" stroke="#2d8659" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>By Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={spending.slice(0, 6)} dataKey="total" nameKey="category"
                cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {spending.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, color: "#1e1e1e" }}
                formatter={(v) => fmt(v)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {spending.slice(0, 6).map((s, i) => (
              <span key={s.category} className="legend-item">
                <span className="legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {s.category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>Recent Transactions</h3>
        <div className="tx-list">
          {transactions.map(tx => (
            <div key={tx.id} className="tx-item">
              <div className="tx-icon">{CATEGORY_ICONS[tx.category] || "📌"}</div>
              <div className="tx-info">
                <div className="tx-desc">{tx.description}</div>
                <div className="tx-date">{fmtDateTime(tx.created_at)}</div>
              </div>
              <div className={`tx-amount ${tx.type === "credit" ? "credit" : "debit"}`}>
                {tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}
              </div>
            </div>
          ))}
          {!transactions.length && <div className="empty-state">No transactions yet</div>}
        </div>
      </div>
    </div>
  );
}
