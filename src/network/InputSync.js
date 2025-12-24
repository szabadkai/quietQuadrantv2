import { decodeInput, encodeInput, EMPTY_INPUT } from "./InputPacket.js";

const SEND_INTERVAL_TICKS = 3;
const BUFFER_LIMIT = 60;

export class InputSync {
    constructor(networkManager) {
        this.network = networkManager;
        this.localBuffer = [];
        this.remoteBuffer = [];
        this.lastSentTick = 0;
        this.lastRemotePacket = null;

        if (this.network) {
            this.unsubscribe = this.network.on("input", (packets) => {
                this.receivePackets(packets);
            });
        }
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }

    processLocalInput(input, tick) {
        const packet = encodeInput(input, tick);
        this.localBuffer.push(packet);
        this.trimBuffer(this.localBuffer);

        if (tick - this.lastSentTick >= SEND_INTERVAL_TICKS) {
            this.sendRecentInputs();
            this.lastSentTick = tick;
        }
    }

    sendRecentInputs() {
        if (!this.network) return;
        const packets = this.localBuffer.slice(-3);
        this.network.sendInputs(packets);
    }

    receivePackets(packets) {
        if (!Array.isArray(packets)) return;
        for (const packet of packets) {
            if (!packet || typeof packet.t !== "number") continue;
            if (this.remoteBuffer.find((entry) => entry.t === packet.t)) continue;
            this.remoteBuffer.push(packet);
            this.lastRemotePacket = packet;
        }
        this.remoteBuffer.sort((a, b) => a.t - b.t);
        this.trimBuffer(this.remoteBuffer);
    }

    getRemoteInput(tick) {
        const packet = this.remoteBuffer.find((entry) => entry.t === tick);
        if (packet) return decodeInput(packet);
        if (this.lastRemotePacket) return decodeInput(this.lastRemotePacket);
        return { ...EMPTY_INPUT };
    }

    trimBuffer(buffer) {
        if (buffer.length > BUFFER_LIMIT) {
            buffer.splice(0, buffer.length - BUFFER_LIMIT);
        }
    }
}
