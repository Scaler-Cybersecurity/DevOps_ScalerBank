import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function SettingsPage() {
  const { apiFetch, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [kycForm, setKycForm] = useState({ aadhaar: "", pan: "" });
  const [kycDone, setKycDone] = useState(false);

  useEffect(() => {
    apiFetch("/auth/profile").then(r => r.json()).then(setProfile);
  }, [apiFetch]);

  const submitKyc = async (e) => {
    e.preventDefault();
    await apiFetch("/auth/kyc", { method: "POST", body: JSON.stringify(kycForm) });
    setKycDone(true);
    apiFetch("/auth/profile").then(r => r.json()).then(setProfile);
  };

  const toggleMfa = async () => {
    await apiFetch("/auth/mfa/toggle", { method: "POST" });
    apiFetch("/auth/profile").then(r => r.json()).then(setProfile);
  };

  if (!profile) return null;

  return (
    <div className="page-content">
      <h2>Settings</h2>

      <div className="section-card">
        <h3>Profile</h3>
        <div className="profile-info">
          <div className="avatar-lg" style={{ background: profile.avatar_color }}>
            {profile.first_name?.[0]}{profile.last_name?.[0]}
          </div>
          <div>
            <div className="profile-name">{profile.first_name} {profile.last_name}</div>
            <div className="profile-email">{profile.email}</div>
            <div className="profile-meta">
              Phone: {profile.phone || "Not set"} · Role: {profile.role}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3>KYC Verification</h3>
        {profile.kyc_status === "verified" || kycDone ? (
          <div className="success-msg">KYC verified ✅</div>
        ) : (
          <form onSubmit={submitKyc}>
            <div className="input-group">
              <label>Aadhaar Number</label>
              <input value={kycForm.aadhaar}
                onChange={e => setKycForm(f => ({ ...f, aadhaar: e.target.value }))}
                placeholder="XXXX XXXX XXXX" required />
            </div>
            <div className="input-group">
              <label>PAN Number</label>
              <input value={kycForm.pan}
                onChange={e => setKycForm(f => ({ ...f, pan: e.target.value }))}
                placeholder="ABCDE1234F" required />
            </div>
            <button type="submit" className="btn-primary btn-compact">Verify KYC</button>
          </form>
        )}
      </div>

      <div className="section-card">
        <h3>Security</h3>
        <div className="setting-row">
          <div>
            <div className="setting-label">Multi-Factor Authentication</div>
            <div className="setting-desc">Add an extra layer of security with TOTP</div>
          </div>
          <button className={`toggle-btn ${profile.mfa_enabled ? "on" : ""}`}
            onClick={toggleMfa}>
            {profile.mfa_enabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      <div className="section-card">
        <button className="btn-danger" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}
