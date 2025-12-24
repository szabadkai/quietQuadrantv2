import React from "react";
import { useNotificationStore } from "../../state/useNotificationStore.js";

export function NotificationToast() {
    const notifications = useNotificationStore((s) => s.notifications);
    const visible = notifications.filter((n) => !n.dismissed);

    if (!visible.length) return null;

    return (
        <div
            style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                zIndex: 20
            }}
        >
            {visible.map((n) => (
                <div
                    key={n.id}
                    className="qq-toast"
                    style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        background: "var(--qq-panel)",
                        border: "1px solid var(--qq-panel-border)",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        color: "var(--qq-text)",
                        minWidth: "220px",
                        boxShadow: "0 0 14px rgba(159, 240, 255, 0.08)"
                    }}
                >
                    <span>{n.icon}</span>
                    <div>
                        <div style={{ fontSize: "12px", opacity: 0.7 }}>{n.title}</div>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>
                            {n.message}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
