import { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useAuth } from "../hooks/useAuth";
import { fmt, fmtDate, CATEGORY_ICONS, PIE_COLORS } from "../utils/constants";

export default function AnalyticsPage() {
  const { apiFetch } = useAuth();
  const [spending, setSpending] = useState([]);
  const [trend, setTrend] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    apiFetch(`/analytics/spending?days=${days}`).then(r => r.json()).then(setSpending);
    apiFetch(`/analytics/trend?days=${days}`).then(r => r.json()).then(setTrend);
    apiFetch("/analytics/monthly").then(r => r.json()).then(setMonthly);
  }, [apiFetch, days]);

  const total = spending.reduce((s, c) => s + c.total, 0);

  const tooltipStyle = {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 8,
    color: "#1e1e1e"
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Analytics</h2>
        <select value={days} onChange={e => setDays(e.target.value)}
          className="select-input" style={{ width: "auto" }}>
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
        </select>
      </div>

      <div className="balance-hero"
        style={{ background: "linear-gradient(135deg, rgba(26,92,58,0.12), rgba(236,72,153,0.08))" }}>
        <div className="balance-label">Total Spending ({days} days)</div>
        <div className="balance-amount">{fmt(total)}</div>
        <div className="balance-sub">
          {spending.reduce((s, c) => s + c.count, 0)} transactions across {spending.length} categories
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
          <h3>Daily Spending vs Income</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#8a8a8a", fontSize: 11 }} tickFormatter={fmtDate} />
              <YAxis tick={{ fill: "#8a8a8a", fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} labelFormatter={fmtDate} />
              <Bar dataKey="spent" fill="#1a5c3a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="received" fill="#2d8659" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={spending} dataKey="total" nameKey="category"
                cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {spending.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Category Details</h3>
          <div className="cat-list">
            {spending.map((s, i) => (
              <div key={s.category} className="cat-item">
                <span className="cat-icon">{CATEGORY_ICONS[s.category] || "📌"}</span>
                <span className="cat-name">{s.category}</span>
                <span className="cat-count">{s.count} txn</span>
                <span className="cat-bar-wrap">
                  <span className="cat-bar"
                    style={{
                      width: `${(s.total / total * 100)}%`,
                      background: PIE_COLORS[i % PIE_COLORS.length]
                    }}
                  />
                </span>
                <span className="cat-total">{fmt(s.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {monthly.length > 0 && (
        <div className="chart-card">
          <h3>Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={[...monthly].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#8a8a8a", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8a8a8a", fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
              <Line type="monotone" dataKey="spent" stroke="#8b1c1c" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="received" stroke="#2d8659" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
