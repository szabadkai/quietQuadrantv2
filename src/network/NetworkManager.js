import { joinRoom } from "trystero/mqtt";
import { generateRoomCode, normalizeRoomCode } from "./RoomCodeGenerator.js";

const DEFAULT_APP_ID = "quiet-quadrant-v2";

// Configure ICE servers for WebRTC
const DEFAULT_RTC_CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
    ],
};

// MQTT broker configuration for Trystero with fallbacks
const MQTT_BROKERS = [
    "wss://test.mosquitto.org:8081/mqtt",
    "wss://broker.emqx.io:8084/mqtt",
    "wss://mqtt.eclipseprojects.io:443/mqtt",
];

function getMqttConfig(attemptIndex = 0) {
    const brokerIndex = attemptIndex % MQTT_BROKERS.length;
    return {
        url: MQTT_BROKERS[brokerIndex],
    };
}

export class NetworkManager {
    constructor({ appId = DEFAULT_APP_ID, rtcConfig } = {}) {
        this.appId = appId;
        this.rtcConfig = rtcConfig || DEFAULT_RTC_CONFIG;
        this.room = null;
        this.roomCode = null;
        this.connectedPeers = new Set();
        this.listeners = {
            peerJoin: new Set(),
            peerLeave: new Set(),
            input: new Set(),
            correction: new Set(),
            start: new Set(),
            error: new Set(),
        };
        this.actions = {};
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 3;
    }

    hostRoom() {
        const roomCode = generateRoomCode();
        this.join(roomCode);
        return roomCode;
    }

    joinRoom(code) {
        const roomCode = normalizeRoomCode(code);
        if (!roomCode) return null;
        this.join(roomCode);
        return roomCode;
    }

    join(roomCode) {
        if (this.room) {
            this.leave();
        }

        this.connectionAttempts++;
        const mqttConfig = getMqttConfig(this.connectionAttempts - 1);

        try {
            const room = joinRoom(
                {
                    appId: this.appId,
                    rtcConfig: this.rtcConfig,
                    ...mqttConfig,
                },
                roomCode
            );

            this.room = room;
            this.roomCode = roomCode;

            if (room.onPeerJoin) {
                room.onPeerJoin((peerId) => {
                    this.connectedPeers.add(peerId);
                    this.emit("peerJoin", peerId);
                });
            }

            if (room.onPeerLeave) {
                room.onPeerLeave((peerId) => {
                    this.connectedPeers.delete(peerId);
                    this.emit("peerLeave", peerId);
                });
            }

            const [sendInput, onInput] = room.makeAction("input");
            const [sendCorrection, onCorrection] =
                room.makeAction("correction");
            const [sendStart, onStart] = room.makeAction("start");

            this.actions = {
                sendInput,
                sendCorrection,
                sendStart,
            };

            onInput((payload, peerId) => this.emit("input", payload, peerId));
            onCorrection((payload, peerId) =>
                this.emit("correction", payload, peerId)
            );
            onStart((payload, peerId) => this.emit("start", payload, peerId));

            // Reset connection attempts on successful connection
            this.connectionAttempts = 0;
        } catch (error) {
            console.warn(
                `MQTT connection failed (attempt ${this.connectionAttempts}):`,
                error
            );

            if (this.connectionAttempts < this.maxConnectionAttempts) {
                console.log(`Retrying with different MQTT broker...`);
                setTimeout(() => this.join(roomCode), 1000);
                return;
            }

            this.emit(
                "error",
                new Error(
                    `Failed to connect after ${this.maxConnectionAttempts} attempts`
                )
            );
        }
    }

    leave() {
        if (!this.room) return;
        try {
            this.room.leave();
        } catch (error) {
            this.emit("error", error);
        }
        this.room = null;
        this.roomCode = null;
        this.connectedPeers.clear();
        this.actions = {};
        this.connectionAttempts = 0; // Reset connection attempts
    }

    on(event, handler) {
        const set = this.listeners[event];
        if (!set) return () => {};
        set.add(handler);
        return () => set.delete(handler);
    }

    emit(event, payload, peerId) {
        const set = this.listeners[event];
        if (!set) return;
        for (const handler of set) {
            handler(payload, peerId);
        }
    }

    sendInputs(packets) {
        if (!this.actions.sendInput) return;
        this.actions.sendInput(packets);
    }

    sendCorrection(snapshot) {
        if (!this.actions.sendCorrection) return;
        this.actions.sendCorrection(snapshot);
    }

    sendStart(payload) {
        if (!this.actions.sendStart) return;
        this.actions.sendStart(payload);
    }
}
