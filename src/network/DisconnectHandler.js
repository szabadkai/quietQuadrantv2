/**
 * Handles peer disconnection, reconnection attempts, and graceful game ending.
 * Implements pause on disconnect, 30-second reconnection window, and cleanup.
 */

const DISCONNECT_TIMEOUT = 3000;
const RECONNECT_WINDOW = 30000;

export class DisconnectHandler {
    constructor({ network, onPause, onResume, onEnd }) {
        this.network = network;
        this.onPause = onPause;
        this.onResume = onResume;
        this.onEnd = onEnd;

        this.disconnectedPeers = new Map();
        this.reconnectTimers = new Map();
        this.timeoutTimers = new Map();
        this.unsubscribers = [];

        this.setupListeners();
    }

    setupListeners() {
        if (!this.network) return;

        const unsubJoin = this.network.on("peerJoin", (peerId) => {
            this.handlePeerReconnect(peerId);
        });

        const unsubLeave = this.network.on("peerLeave", (peerId) => {
            this.handlePeerDisconnect(peerId);
        });

        this.unsubscribers.push(unsubJoin, unsubLeave);
    }

    handlePeerDisconnect(peerId) {
        if (this.disconnectedPeers.has(peerId)) return;

        this.disconnectedPeers.set(peerId, {
            disconnectedAt: Date.now(),
            state: "disconnected",
        });

        const timeoutTimer = setTimeout(() => {
            this.confirmDisconnect(peerId);
        }, DISCONNECT_TIMEOUT);

        this.timeoutTimers.set(peerId, timeoutTimer);
    }

    confirmDisconnect(peerId) {
        const info = this.disconnectedPeers.get(peerId);
        if (!info || info.state !== "disconnected") return;

        info.state = "waiting-reconnect";
        this.disconnectedPeers.set(peerId, info);

        this.onPause?.({ peerId, reason: "peer-disconnected" });

        const reconnectTimer = setTimeout(() => {
            this.handleReconnectTimeout(peerId);
        }, RECONNECT_WINDOW);

        this.reconnectTimers.set(peerId, reconnectTimer);
    }

    handlePeerReconnect(peerId) {
        const info = this.disconnectedPeers.get(peerId);
        if (!info) return;

        this.clearTimers(peerId);
        this.disconnectedPeers.delete(peerId);

        if (info.state === "waiting-reconnect") {
            this.onResume?.({ peerId });
        }
    }

    handleReconnectTimeout(peerId) {
        const info = this.disconnectedPeers.get(peerId);
        if (!info) return;

        this.clearTimers(peerId);
        this.disconnectedPeers.delete(peerId);

        this.onEnd?.({ peerId, reason: "reconnect-timeout" });
    }

    clearTimers(peerId) {
        const timeout = this.timeoutTimers.get(peerId);
        if (timeout) {
            clearTimeout(timeout);
            this.timeoutTimers.delete(peerId);
        }

        const reconnect = this.reconnectTimers.get(peerId);
        if (reconnect) {
            clearTimeout(reconnect);
            this.reconnectTimers.delete(peerId);
        }
    }

    getDisconnectedPeers() {
        return Array.from(this.disconnectedPeers.entries()).map(
            ([id, info]) => ({
                peerId: id,
                ...info,
                timeRemaining: this.getTimeRemaining(id),
            })
        );
    }

    getTimeRemaining(peerId) {
        const info = this.disconnectedPeers.get(peerId);
        if (!info || info.state !== "waiting-reconnect") return 0;

        const elapsed = Date.now() - info.disconnectedAt - DISCONNECT_TIMEOUT;
        return Math.max(0, RECONNECT_WINDOW - elapsed);
    }

    isWaitingForReconnect() {
        for (const info of this.disconnectedPeers.values()) {
            if (info.state === "waiting-reconnect") return true;
        }
        return false;
    }

    destroy() {
        for (const unsub of this.unsubscribers) {
            unsub?.();
        }
        this.unsubscribers = [];

        for (const peerId of this.disconnectedPeers.keys()) {
            this.clearTimers(peerId);
        }
        this.disconnectedPeers.clear();
    }
}
