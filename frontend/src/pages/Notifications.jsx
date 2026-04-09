import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fmtDateTime } from "../utils/constants";

export default function NotificationsPage() {
  const { apiFetch } = useAuth();
  const [notifs, setNotifs] = useState([]);

  const load = () => apiFetch("/notifications").then(r => r.json()).then(setNotifs);
  useEffect(() => { load(); }, [apiFetch]);

  const markAllRead = async () => {
    await apiFetch("/notifications/read", { method: "POST", body: JSON.stringify({}) });
    load();
  };

  const typeIcons = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" };
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Notifications {unread > 0 && <span className="badge">{unread}</span>}</h2>
        {unread > 0 && (
          <button className="btn-sm" onClick={markAllRead}>Mark all read</button>
        )}
      </div>
      <div className="section-card">
        <div className="notif-list">
          {notifs.map(n => (
            <div key={n.id} className={`notif-item ${n.read ? "read" : "unread"}`}>
              <span className="notif-icon">{typeIcons[n.type] || "ℹ️"}</span>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{fmtDateTime(n.created_at)}</div>
              </div>
            </div>
          ))}
          {!notifs.length && <div className="empty-state">No notifications</div>}
        </div>
      </div>
    </div>
  );
}
