import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fmt } from "../utils/constants";

export default function SavingsPage() {
  const { apiFetch } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", targetAmount: "", icon: "🎯", color: "#1a5c3a" });
  const [depositAmounts, setDepositAmounts] = useState({});

  const load = () => apiFetch("/goals").then(r => r.json()).then(setGoals);
  useEffect(() => { load(); }, [apiFetch]);

  const create = async (e) => {
    e.preventDefault();
    await apiFetch("/goals", {
      method: "POST",
      body: JSON.stringify({ ...form, targetAmount: parseFloat(form.targetAmount) })
    });
    setShowNew(false);
    setForm({ name: "", targetAmount: "", icon: "🎯", color: "#1a5c3a" });
    load();
  };

  const deposit = async (id) => {
    const amount = parseFloat(depositAmounts[id]);
    if (!amount || amount <= 0) return;
    await apiFetch(`/goals/${id}/deposit`, {
      method: "POST", body: JSON.stringify({ amount })
    });
    setDepositAmounts(d => ({ ...d, [id]: "" }));
    load();
  };

  const remove = async (id) => {
    await apiFetch(`/goals/${id}`, { method: "DELETE" });
    load();
  };

  const icons = ["🎯", "🏠", "✈️", "🚗", "💍", "🎓", "💰", "🏖️", "📱", "🎁"];

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Savings Goals</h2>
        <button className="btn-sm" onClick={() => setShowNew(true)}>+ New Goal</button>
      </div>

      {showNew && (
        <div className="section-card" style={{ marginBottom: 20 }}>
          <form onSubmit={create}>
            <div className="input-group">
              <label>Goal Name</label>
              <input value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Vacation Fund" required />
            </div>
            <div className="input-group">
              <label>Target Amount (₹)</label>
              <input type="number" value={form.targetAmount}
                onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))}
                min="100" required />
            </div>
            <div className="input-group">
              <label>Icon</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {icons.map(ic => (
                  <button key={ic} type="button"
                    className={`icon-btn ${form.icon === ic ? "active" : ""}`}
                    onClick={() => setForm(f => ({ ...f, icon: ic }))}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="btn-primary btn-compact">Create Goal</button>
              <button type="button" className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="goals-grid">
        {goals.map(g => {
          const pct = Math.min((g.current_amount / g.target_amount) * 100, 100);
          return (
            <div key={g.id} className="goal-card">
              <div className="goal-header">
                <span className="goal-icon">{g.icon}</span>
                <span className="goal-name">{g.name}</span>
                <button className="btn-ghost btn-xs" onClick={() => remove(g.id)}>✕</button>
              </div>
              <div className="goal-amounts">
                <span>{fmt(g.current_amount)}</span>
                <span className="goal-target">of {fmt(g.target_amount)}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"
                  style={{ width: `${pct}%`, background: g.color || "#1a5c3a" }} />
              </div>
              <div className="goal-pct">{pct.toFixed(0)}% complete</div>
              <div className="goal-deposit">
                <input type="number" placeholder="Amount"
                  value={depositAmounts[g.id] || ""}
                  onChange={e => setDepositAmounts(d => ({ ...d, [g.id]: e.target.value }))} />
                <button className="btn-sm" onClick={() => deposit(g.id)}>Add</button>
              </div>
            </div>
          );
        })}
        {!goals.length && !showNew && (
          <div className="empty-state">No savings goals yet. Create one to start saving!</div>
        )}
      </div>
    </div>
  );
}
