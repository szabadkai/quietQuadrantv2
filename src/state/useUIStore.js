import { create } from "zustand";

export const useUIStore = create((set, get) => ({
    screen: "title",
    paused: false,
    pauseReason: null,
    disconnectInfo: null,
    reconnectTimeRemaining: 0,
    actions: {
        setScreen: (screen) => set({ screen }),
        setPaused: (paused, reason = null) =>
            set({ paused, pauseReason: reason }),
        setDisconnectInfo: (info) => set({ disconnectInfo: info }),
        setReconnectTimeRemaining: (time) =>
            set({ reconnectTimeRemaining: time }),
        clearDisconnect: () =>
            set({
                paused: false,
                pauseReason: null,
                disconnectInfo: null,
                reconnectTimeRemaining: 0,
            }),
    },
}));
