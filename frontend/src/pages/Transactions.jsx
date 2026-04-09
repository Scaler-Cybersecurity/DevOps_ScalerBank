import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fmt, fmtDateTime, CATEGORY_ICONS } from "../utils/constants";

export default function TransactionsPage() {
  const { apiFetch } = useAuth();
  const [txns, setTxns] = useState([]);
  const [filter, setFilter] = useState({ category: "all", type: "all" });

  useEffect(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (filter.category !== "all") params.set("category", filter.category);
    if (filter.type !== "all") params.set("type", filter.type);
    apiFetch(`/transactions?${params}`).then(r => r.json()).then(setTxns);
  }, [apiFetch, filter]);

  return (
    <div className="page-content">
      <h2>Transactions</h2>
      <div className="filter-row">
        <select
          value={filter.category}
          onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
          className="select-input"
        >
          <option value="all">All Categories</option>
          {Object.keys(CATEGORY_ICONS).map(c => (
            <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
          ))}
        </select>
        <select
          value={filter.type}
          onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          className="select-input"
        >
          <option value="all">All Types</option>
          <option value="debit">Debits</option>
          <option value="credit">Credits</option>
        </select>
      </div>

      <div className="section-card">
        <div className="tx-list">
          {txns.map(tx => (
            <div key={tx.id} className="tx-item">
              <div className="tx-icon">{CATEGORY_ICONS[tx.category] || "📌"}</div>
              <div className="tx-info">
                <div className="tx-desc">{tx.description}</div>
                <div className="tx-date">
                  {fmtDateTime(tx.created_at)} · {tx.category} · {tx.status}
                </div>
              </div>
              <div className={`tx-amount ${tx.type === "credit" ? "credit" : "debit"}`}>
                {tx.type === "credit" ? "+" : "-"}{fmt(tx.amount)}
              </div>
            </div>
          ))}
          {!txns.length && <div className="empty-state">No transactions found</div>}
        </div>
      </div>
    </div>
  );
}
