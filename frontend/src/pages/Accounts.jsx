import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fmt, fmtDateTime } from "../utils/constants";

export default function AccountsPage() {
  const { apiFetch } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newCur, setNewCur] = useState("INR");

  useEffect(() => {
    apiFetch("/accounts").then(r => r.json()).then(setAccounts);
  }, [apiFetch]);

  useEffect(() => {
    if (selected) apiFetch(`/accounts/${selected}`).then(r => r.json()).then(setDetail);
    else setDetail(null);
  }, [selected, apiFetch]);

  const createAccount = async () => {
    const res = await apiFetch("/accounts", {
      method: "POST", body: JSON.stringify({ currency: newCur })
    });
    if (res.ok) {
      const a = await res.json();
      setAccounts(prev => [...prev, a]);
      setShowNew(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Accounts</h2>
        <button className="btn-sm" onClick={() => setShowNew(true)}>+ New Account</button>
      </div>

      {showNew && (
        <div className="section-card" style={{ marginBottom: 20 }}>
          <h3>Open New Account</h3>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
            <select value={newCur} onChange={e => setNewCur(e.target.value)} className="select-input">
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
            <button className="btn-primary btn-compact" onClick={createAccount}>Create</button>
            <button className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="cards-row">
        {accounts.map(a => (
          <div key={a.id}
            className={`account-card clickable ${selected === a.id ? "active" : ""}`}
            onClick={() => setSelected(selected === a.id ? null : a.id)}>
            <div className="ac-currency">{a.currency}</div>
            <div className="ac-balance">{fmt(a.balance || 0, a.currency)}</div>
            <div className="ac-number">{a.account_number}</div>
            <div className="ac-type">{a.account_type || "savings"} · {a.status || "active"}</div>
          </div>
        ))}
      </div>

      {detail && (
        <div className="section-card">
          <h3>Ledger — {detail.account_number}</h3>
          <div className="tx-list">
            {(detail.ledger || []).map(entry => (
              <div key={entry.id} className="tx-item">
                <div className="tx-icon">{entry.type === "CREDIT" ? "📥" : "📤"}</div>
                <div className="tx-info">
                  <div className="tx-desc">{entry.description}</div>
                  <div className="tx-date">
                    {fmtDateTime(entry.created_at)} · Bal: {fmt(entry.balance_after)}
                  </div>
                </div>
                <div className={`tx-amount ${entry.type === "CREDIT" ? "credit" : "debit"}`}>
                  {entry.type === "CREDIT" ? "+" : "-"}{fmt(entry.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
