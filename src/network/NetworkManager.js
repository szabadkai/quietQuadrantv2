import { joinRoom } from "trystero";
import { generateRoomCode, normalizeRoomCode } from "./RoomCodeGenerator.js";

const DEFAULT_APP_ID = "quiet-quadrant-v2";

export class NetworkManager {
  constructor({ appId = DEFAULT_APP_ID, rtcConfig } = {}) {
    this.appId = appId;
    this.rtcConfig = rtcConfig;
    this.room = null;
    this.roomCode = null;
    this.connectedPeers = new Set();
    this.listeners = {
      peerJoin: new Set(),
      peerLeave: new Set(),
      input: new Set(),
      correction: new Set(),
      start: new Set(),
      error: new Set()
    };
    this.actions = {};
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

    const room = joinRoom(
      {
        appId: this.appId,
        ...(this.rtcConfig ? { rtcConfig: this.rtcConfig } : {})
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
    const [sendCorrection, onCorrection] = room.makeAction("correction");
    const [sendStart, onStart] = room.makeAction("start");

    this.actions = {
      sendInput,
      sendCorrection,
      sendStart
    };

    onInput((payload, peerId) => this.emit("input", payload, peerId));
    onCorrection((payload, peerId) => this.emit("correction", payload, peerId));
    onStart((payload, peerId) => this.emit("start", payload, peerId));
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
