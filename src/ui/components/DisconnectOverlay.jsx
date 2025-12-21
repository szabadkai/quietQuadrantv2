import React from "react";
import { useUIStore } from "../../state/useUIStore.js";

export function DisconnectOverlay() {
  const paused = useUIStore((s) => s.paused);
  const pauseReason = useUIStore((s) => s.pauseReason);
  const reconnectTime = useUIStore((s) => s.reconnectTimeRemaining);

  if (!paused || pauseReason !== "peer-disconnected") {
    return null;
  }

  const seconds = Math.ceil(reconnectTime / 1000);

  return (
    <div className="qq-disconnect-overlay">
      <div className="qq-disconnect-modal">
        <div className="qq-disconnect-icon">⚠️</div>
        <h2>Partner Disconnected</h2>
        <p>Waiting for reconnection...</p>
        <div className="qq-disconnect-timer">
          <div className="qq-timer-bar">
            <div
              className="qq-timer-fill"
              style={{ width: `${(reconnectTime / 30000) * 100}%` }}
            />
          </div>
          <span>{seconds}s remaining</span>
        </div>
        <p className="qq-disconnect-hint">
          Game will end if partner doesn't reconnect
        </p>
      </div>
    </div>
  );
}
