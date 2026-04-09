import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AccountsPage from "./pages/Accounts";
import TransactionsPage from "./pages/Transactions";
import TransferPage from "./pages/Transfer";
import AnalyticsPage from "./pages/Analytics";
import SavingsPage from "./pages/Savings";
import FXPage from "./pages/FX";
import NotificationsPage from "./pages/Notifications";
import SettingsPage from "./pages/Settings";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "⬡" },
  { key: "accounts", label: "Accounts", icon: "◎" },
  { key: "transactions", label: "History", icon: "☰" },
  { key: "transfer", label: "Payments", icon: "↗" },
  { key: "analytics", label: "Analytics", icon: "◫" },
  { key: "savings", label: "Savings", icon: "◈" },
  { key: "fx", label: "FX Rates", icon: "⇄" },
  { key: "notifications", label: "Alerts", icon: "◉" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

function Sidebar({ active, onNav, user }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">S</div>
        <span className="logo-text">ScalerBank</span>
      </div>
      <div className="nav-items">
        {NAV_ITEMS.map(item => (
          <button key={item.key}
            className={`nav-item ${active === item.key ? "active" : ""}`}
            onClick={() => onNav(item.key)}>
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-user">
        <div className="avatar-sm"
          style={{ background: user?.avatar_color || user?.avatarColor || "#1a5c3a" }}>
          {(user?.first_name || user?.firstName || "U")[0]}
        </div>
        <span className="user-name">{user?.first_name || user?.firstName}</span>
      </div>
    </nav>
  );
}

function AppShell() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "accounts": return <AccountsPage />;
      case "transactions": return <TransactionsPage />;
      case "transfer": return <TransferPage />;
      case "analytics": return <AnalyticsPage />;
      case "savings": return <SavingsPage />;
      case "fx": return <FXPage />;
      case "notifications": return <NotificationsPage />;
      case "settings": return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar active={page} onNav={setPage} user={user} />
      <main className="main-area">
        {renderPage()}
      </main>
    </div>
  );
}

function AuthGate({ authPage, setAuthPage }) {
  const { user } = useAuth();
  if (!user) {
    return authPage === "login"
      ? <LoginPage onSwitch={() => setAuthPage("register")} />
      : <RegisterPage onSwitch={() => setAuthPage("login")} />;
  }
  return <AppShell />;
}

export default function App() {
  const [authPage, setAuthPage] = useState("login");

  return (
    <AuthProvider>
      <GlobalStyles />
      <AuthGate authPage={authPage} setAuthPage={setAuthPage} />
    </AuthProvider>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body, html {
        font-family: 'DM Sans', sans-serif;
        background: #f5f3ef;
        color: #1e1e1e;
        -webkit-font-smoothing: antialiased;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

      .auth-page {
        min-height: 100vh; display: flex; align-items: center; justify-content: center;
        background: radial-gradient(ellipse at 30% 20%, rgba(26,92,58,0.06) 0%, transparent 60%),
                    radial-gradient(ellipse at 70% 80%, rgba(139,28,28,0.04) 0%, transparent 60%), #f5f3ef;
        padding: 20px;
      }
      .auth-card {
        width: 100%; max-width: 400px; padding: 40px;
        background: #ffffff; border: 1px solid #e0ddd6;
        border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); animation: fadeIn 0.5s ease;
      }
      .auth-logo { text-align: center; margin-bottom: 32px; }
      .logo-icon {
        width: 56px; height: 56px; border-radius: 14px; margin: 0 auto 12px;
        background: linear-gradient(135deg, #1a5c3a, #14472d);
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; font-weight: 700; color: white;
        box-shadow: 0 8px 32px rgba(26,92,58,0.25);
      }
      .auth-logo h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #1e1e1e; }
      .auth-logo p { color: #6b6b6b; font-size: 14px; margin-top: 4px; }
      .auth-switch { text-align: center; margin-top: 20px; color: #6b6b6b; font-size: 13px; }
      .auth-switch button { background: none; border: none; color: #1a5c3a; cursor: pointer; font-size: 13px; text-decoration: underline; font-weight: 500; }

      .input-group { margin-bottom: 16px; }
      .input-group label { display: block; font-size: 12px; font-weight: 500; color: #6b6b6b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
      .input-group input, .select-input {
        width: 100%; padding: 10px 14px; font-size: 14px; font-family: inherit;
        background: #fafaf8; border: 1px solid #d9d5cd;
        border-radius: 8px; color: #1e1e1e; outline: none; transition: border 0.2s;
      }
      .input-group input:focus, .select-input:focus { border-color: #1a5c3a; }
      .select-input {
        appearance: none; cursor: pointer;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%236b6b6b' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
      }
      .select-input option { background: #ffffff; color: #1e1e1e; }
      .btn-primary {
        width: 100%; padding: 12px; font-size: 14px; font-weight: 600; font-family: inherit;
        background: linear-gradient(135deg, #1a5c3a, #14472d); color: white; border: none;
        border-radius: 8px; cursor: pointer; transition: all 0.2s; margin-top: 8px;
      }
      .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,92,58,0.25); }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .btn-compact { width: auto; padding: 8px 20px; }
      .btn-sm { padding: 6px 16px; font-size: 12px; font-weight: 500; background: rgba(26,92,58,0.08); color: #1a5c3a; border: 1px solid rgba(26,92,58,0.18); border-radius: 6px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
      .btn-sm:hover { background: rgba(26,92,58,0.14); }
      .btn-ghost { padding: 8px 16px; font-size: 13px; background: none; border: none; color: #6b6b6b; cursor: pointer; font-family: inherit; }
      .btn-ghost:hover { color: #1e1e1e; }
      .btn-xs { padding: 2px 8px; font-size: 11px; }
      .btn-danger { padding: 10px 24px; font-size: 14px; font-weight: 500; background: rgba(139,28,28,0.08); color: #8b1c1c; border: 1px solid rgba(139,28,28,0.18); border-radius: 8px; cursor: pointer; font-family: inherit; }
      .btn-danger:hover { background: rgba(139,28,28,0.14); }
      .error-msg { padding: 10px 14px; background: rgba(139,28,28,0.06); border: 1px solid rgba(139,28,28,0.15); border-radius: 8px; color: #8b1c1c; font-size: 13px; margin-bottom: 16px; }
      .success-msg { padding: 10px 14px; background: rgba(26,92,58,0.06); border: 1px solid rgba(26,92,58,0.15); border-radius: 8px; color: #1a5c3a; font-size: 13px; margin-bottom: 16px; }

      .app-shell { display: flex; min-height: 100vh; background: #f5f3ef; }
      .sidebar {
        width: 230px; min-height: 100vh; padding: 24px 12px;
        background: #ffffff; border-right: 1px solid #e0ddd6;
        display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 10;
      }
      .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 0 8px 24px; }
      .logo-mark {
        width: 34px; height: 34px; border-radius: 10px;
        background: linear-gradient(135deg, #1a5c3a, #14472d);
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; font-weight: 700; color: white;
      }
      .logo-text { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: #1e1e1e; }
      .nav-items { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      .nav-item {
        display: flex; align-items: center; gap: 10px; padding: 10px 12px;
        border: none; background: none; color: #6b6b6b; font-size: 13px; font-weight: 500;
        font-family: inherit; cursor: pointer; border-radius: 8px; transition: all 0.15s; text-align: left;
      }
      .nav-item:hover { background: #f5f3ef; color: #3a3a3a; }
      .nav-item.active { background: rgba(26,92,58,0.08); color: #1a5c3a; font-weight: 600; }
      .nav-icon { font-size: 16px; width: 20px; text-align: center; }
      .sidebar-user { display: flex; align-items: center; gap: 10px; padding: 16px 8px 0; border-top: 1px solid #e0ddd6; }
      .avatar-sm { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; }
      .avatar-lg { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 600; color: white; flex-shrink: 0; }
      .user-name { font-size: 13px; color: #6b6b6b; }
      .main-area { flex: 1; margin-left: 230px; min-height: 100vh; }
      .page-content { padding: 32px; max-width: 1100px; animation: fadeIn 0.3s ease; }
      .page-content h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: #1e1e1e; margin-bottom: 20px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .page-header h2 { margin-bottom: 0; }

      .balance-hero {
        padding: 28px 32px; border-radius: 16px; margin-bottom: 24px;
        background: linear-gradient(135deg, rgba(26,92,58,0.07), rgba(26,92,58,0.03));
        border: 1px solid rgba(26,92,58,0.12);
      }
      .balance-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #1a5c3a; font-weight: 500; }
      .balance-amount { font-size: 36px; font-weight: 700; letter-spacing: -1px; color: #1e1e1e; margin: 4px 0; }
      .balance-sub { font-size: 13px; color: #6b6b6b; }

      .cards-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-bottom: 24px; }
      .account-card { padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e0ddd6; transition: all 0.2s; }
      .account-card.clickable { cursor: pointer; }
      .account-card.clickable:hover { background: #fafaf8; border-color: rgba(26,92,58,0.3); }
      .account-card.active { border-color: #1a5c3a; background: rgba(26,92,58,0.03); }
      .ac-currency { font-size: 11px; font-weight: 600; color: #1a5c3a; letter-spacing: 1px; }
      .ac-balance { font-size: 22px; font-weight: 700; color: #1e1e1e; margin: 4px 0; }
      .ac-number { font-size: 12px; color: #6b6b6b; font-family: 'JetBrains Mono', monospace; }
      .ac-type { font-size: 11px; color: #8a8a8a; margin-top: 4px; text-transform: capitalize; }

      .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
      .chart-card { padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e0ddd6; }
      .chart-card h3 { font-size: 13px; font-weight: 600; color: #6b6b6b; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
      .pie-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; justify-content: center; }
      .legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #6b6b6b; }
      .legend-dot { width: 8px; height: 8px; border-radius: 2px; }

      .section-card { padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e0ddd6; margin-bottom: 20px; }
      .section-card h3 { font-size: 13px; font-weight: 600; color: #6b6b6b; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px; }

      .tx-list { display: flex; flex-direction: column; }
      .tx-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #eeece7; animation: slideIn 0.2s ease; }
      .tx-item:last-child { border-bottom: none; }
      .tx-icon { font-size: 20px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f5f3ef; border-radius: 8px; }
      .tx-info { flex: 1; min-width: 0; }
      .tx-desc { font-size: 14px; font-weight: 500; color: #1e1e1e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tx-date { font-size: 11px; color: #8a8a8a; margin-top: 2px; }
      .tx-amount { font-size: 14px; font-weight: 600; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
      .tx-amount.credit { color: #1a5c3a; }
      .tx-amount.debit { color: #8b1c1c; }

      .tab-row { display: flex; gap: 4px; margin-bottom: 20px; background: #f5f3ef; border-radius: 8px; padding: 4px; width: fit-content; }
      .tab-btn { padding: 8px 20px; font-size: 13px; font-weight: 500; background: none; border: none; color: #6b6b6b; cursor: pointer; border-radius: 6px; font-family: inherit; transition: all 0.15s; }
      .tab-btn.active { background: rgba(26,92,58,0.1); color: #1a5c3a; font-weight: 600; }
      .filter-row { display: flex; gap: 12px; margin-bottom: 20px; }
      .filter-row .select-input { width: 180px; }

      .cat-list { display: flex; flex-direction: column; gap: 10px; }
      .cat-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
      .cat-icon { font-size: 16px; }
      .cat-name { width: 90px; color: #3a3a3a; text-transform: capitalize; }
      .cat-count { width: 50px; color: #8a8a8a; font-size: 11px; }
      .cat-bar-wrap { flex: 1; height: 6px; background: #eeece7; border-radius: 3px; overflow: hidden; }
      .cat-bar { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
      .cat-total { width: 80px; text-align: right; color: #3a3a3a; font-family: 'JetBrains Mono', monospace; font-size: 12px; }

      .goals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
      .goal-card { padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e0ddd6; }
      .goal-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
      .goal-icon { font-size: 22px; }
      .goal-name { flex: 1; font-size: 15px; font-weight: 600; color: #1e1e1e; }
      .goal-amounts { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
      .goal-amounts span:first-child { font-weight: 600; color: #1e1e1e; }
      .goal-target { color: #6b6b6b; font-size: 12px; }
      .progress-bar { height: 6px; background: #eeece7; border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
      .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
      .goal-pct { font-size: 11px; color: #6b6b6b; margin-bottom: 12px; }
      .goal-deposit { display: flex; gap: 8px; }
      .goal-deposit input { flex: 1; padding: 6px 10px; font-size: 13px; font-family: inherit; background: #fafaf8; border: 1px solid #d9d5cd; border-radius: 6px; color: #1e1e1e; outline: none; }
      .icon-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #d9d5cd; background: #fafaf8; font-size: 18px; cursor: pointer; transition: all 0.15s; }
      .icon-btn.active { border-color: #1a5c3a; background: rgba(26,92,58,0.08); }

      .fx-converter { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
      .fx-converter .input-group { flex: 1; min-width: 140px; margin-bottom: 0; }
      .fx-swap { padding: 10px; font-size: 18px; background: #f5f3ef; border: 1px solid #d9d5cd; border-radius: 8px; color: #1a5c3a; cursor: pointer; }
      .fx-result { text-align: center; margin-top: 24px; padding: 20px; background: rgba(26,92,58,0.05); border-radius: 12px; }
      .fx-amount { font-size: 32px; font-weight: 700; color: #1e1e1e; }
      .fx-rate { font-size: 13px; color: #6b6b6b; margin-top: 4px; }
      .rates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
      .rate-card { display: flex; justify-content: space-between; padding: 12px; background: #fafaf8; border-radius: 8px; border: 1px solid #eeece7; }
      .rate-pair { font-size: 12px; color: #6b6b6b; }
      .rate-value { font-size: 14px; font-weight: 600; color: #1e1e1e; font-family: 'JetBrains Mono', monospace; }

      .badge { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; background: #8b1c1c; color: white; font-size: 11px; font-weight: 600; margin-left: 8px; vertical-align: middle; }
      .notif-list { display: flex; flex-direction: column; }
      .notif-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid #eeece7; }
      .notif-item:last-child { border-bottom: none; }
      .notif-item.unread { background: rgba(26,92,58,0.04); margin: 0 -20px; padding: 14px 20px; border-radius: 8px; }
      .notif-icon { font-size: 18px; margin-top: 2px; }
      .notif-body { flex: 1; }
      .notif-title { font-size: 14px; font-weight: 600; color: #1e1e1e; }
      .notif-msg { font-size: 13px; color: #6b6b6b; margin-top: 2px; }
      .notif-time { font-size: 11px; color: #8a8a8a; margin-top: 4px; }

      .profile-info { display: flex; align-items: center; gap: 16px; }
      .profile-name { font-size: 18px; font-weight: 600; color: #1e1e1e; }
      .profile-email { font-size: 13px; color: #6b6b6b; }
      .profile-meta { font-size: 12px; color: #8a8a8a; margin-top: 4px; }
      .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
      .setting-label { font-size: 14px; font-weight: 500; color: #1e1e1e; }
      .setting-desc { font-size: 12px; color: #6b6b6b; margin-top: 2px; }
      .toggle-btn { padding: 6px 16px; font-size: 12px; font-weight: 500; border-radius: 20px; border: 1px solid #d9d5cd; background: #fafaf8; color: #6b6b6b; cursor: pointer; font-family: inherit; transition: all 0.2s; }
      .toggle-btn.on { background: rgba(26,92,58,0.1); border-color: rgba(26,92,58,0.3); color: #1a5c3a; }
      .ben-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
      .chip { padding: 4px 12px; font-size: 11px; background: rgba(26,92,58,0.06); border: 1px solid rgba(26,92,58,0.15); color: #1a5c3a; border-radius: 20px; cursor: pointer; font-family: inherit; }
      .chip:hover { background: rgba(26,92,58,0.12); }
      .empty-state { text-align: center; padding: 40px; color: #8a8a8a; font-size: 14px; }

      @media (max-width: 768px) {
        .sidebar { width: 60px; padding: 16px 8px; }
        .logo-text, .nav-label, .user-name { display: none; }
        .main-area { margin-left: 60px; }
        .page-content { padding: 20px 16px; }
        .charts-grid { grid-template-columns: 1fr; }
        .fx-converter { flex-direction: column; }
        .balance-amount { font-size: 28px; }
      }
    `}</style>
  );
}
