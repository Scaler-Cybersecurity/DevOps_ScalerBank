import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fmt } from "../utils/constants";

export default function FXPage() {
  const { apiFetch } = useAuth();
  const [rates, setRates] = useState([]);
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("1000");
  const [result, setResult] = useState(null);

  useEffect(() => {
    apiFetch("/fx/rates").then(r => r.json()).then(setRates);
  }, [apiFetch]);

  const convert = async () => {
    const res = await apiFetch("/fx/convert", {
      method: "POST",
      body: JSON.stringify({ fromCurrency: from, toCurrency: to, amount: parseFloat(amount) })
    });
    if (res.ok) setResult(await res.json());
  };

  const currencies = [...new Set(rates.map(r => r.from_currency))];

  return (
    <div className="page-content">
      <h2>Currency Exchange</h2>
      <div className="section-card">
        <div className="fx-converter">
          <div className="input-group">
            <label>From</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select value={from} onChange={e => setFrom(e.target.value)}
                className="select-input" style={{ width: 100 }}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" value={amount}
                onChange={e => setAmount(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>
          <button className="fx-swap"
            onClick={() => { setFrom(to); setTo(from); setResult(null); }}>⇄</button>
          <div className="input-group">
            <label>To</label>
            <select value={to} onChange={e => setTo(e.target.value)} className="select-input">
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={convert}>Convert</button>
        </div>
        {result && (
          <div className="fx-result">
            <div className="fx-amount">{fmt(result.converted, result.toCurrency)}</div>
            <div className="fx-rate">Rate: 1 {result.fromCurrency} = {result.rate} {result.toCurrency}</div>
          </div>
        )}
      </div>

      <div className="section-card">
        <h3>Live Rates</h3>
        <div className="rates-grid">
          {rates.map(r => (
            <div key={r.id} className="rate-card">
              <span className="rate-pair">{r.from_currency} → {r.to_currency}</span>
              <span className="rate-value">{r.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
