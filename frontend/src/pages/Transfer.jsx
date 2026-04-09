import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fmt, CATEGORY_ICONS } from "../utils/constants";

export default function TransferPage() {
  const { apiFetch } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [tab, setTab] = useState("transfer");
  const [form, setForm] = useState({
    fromAccountId: "", toAccountNumber: "", amount: "",
    description: "", category: "transfer"
  });
  const [billForm, setBillForm] = useState({
    fromAccountId: "", billerName: "", amount: "", category: "bills"
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/accounts").then(r => r.json()).then(d => {
      setAccounts(d);
      if (d.length) {
        setForm(f => ({ ...f, fromAccountId: d[0].id }));
        setBillForm(f => ({ ...f, fromAccountId: d[0].id }));
      }
    });
    apiFetch("/beneficiaries").then(r => r.json()).then(setBeneficiaries);
  }, [apiFetch]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true);
    try {
      const res = await apiFetch("/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          idempotencyKey: crypto.randomUUID()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setForm(f => ({ ...f, toAccountNumber: "", amount: "", description: "" }));
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleBill = async (e) => {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true);
    try {
      const res = await apiFetch("/transactions/bill-payment", {
        method: "POST",
        body: JSON.stringify({ ...billForm, amount: parseFloat(billForm.amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setBillForm(f => ({ ...f, billerName: "", amount: "" }));
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="page-content">
      <h2>Payments</h2>
      <div className="tab-row">
        <button
          className={`tab-btn ${tab === "transfer" ? "active" : ""}`}
          onClick={() => { setTab("transfer"); setResult(null); setError(""); }}
        >Transfer</button>
        <button
          className={`tab-btn ${tab === "bill" ? "active" : ""}`}
          onClick={() => { setTab("bill"); setResult(null); setError(""); }}
        >Bill Payment</button>
      </div>

      {result && (
        <div className="success-msg">
          Payment successful! New balance: {fmt(result.balance)}
        </div>
      )}
      {error && <div className="error-msg">{error}</div>}

      {tab === "transfer" && (
        <div className="section-card">
          <form onSubmit={handleTransfer}>
            <div className="input-group">
              <label>From Account</label>
              <select
                value={form.fromAccountId}
                onChange={e => setForm(f => ({ ...f, fromAccountId: e.target.value }))}
                className="select-input"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.account_number} ({a.currency} · {fmt(a.balance, a.currency)})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>To Account Number</label>
              <input
                value={form.toAccountNumber}
                onChange={e => setForm(f => ({ ...f, toAccountNumber: e.target.value }))}
                placeholder="SB..." required
              />
              {beneficiaries.length > 0 && (
                <div className="ben-chips">
                  {beneficiaries.map(b => (
                    <button key={b.id} type="button" className="chip"
                      onClick={() => setForm(f => ({ ...f, toAccountNumber: b.account_number }))}>
                      {b.nickname || b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="input-group">
              <label>Amount</label>
              <input
                type="number" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                min="1" step="0.01" required
              />
            </div>
            <div className="input-group">
              <label>Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional note"
              />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="select-input"
              >
                {Object.keys(CATEGORY_ICONS).map(c => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Money"}
            </button>
          </form>
        </div>
      )}

      {tab === "bill" && (
        <div className="section-card">
          <form onSubmit={handleBill}>
            <div className="input-group">
              <label>From Account</label>
              <select
                value={billForm.fromAccountId}
                onChange={e => setBillForm(f => ({ ...f, fromAccountId: e.target.value }))}
                className="select-input"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.account_number} ({a.currency})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Biller Name</label>
              <input
                value={billForm.billerName}
                onChange={e => setBillForm(f => ({ ...f, billerName: e.target.value }))}
                placeholder="e.g., Electricity Bill" required
              />
            </div>
            <div className="input-group">
              <label>Amount</label>
              <input
                type="number" value={billForm.amount}
                onChange={e => setBillForm(f => ({ ...f, amount: e.target.value }))}
                min="1" required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Paying..." : "Pay Bill"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
