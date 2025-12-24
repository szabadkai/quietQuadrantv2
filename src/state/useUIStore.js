import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useUIStore = create(
    devtools(
        (set) => ({
            screen: "title",
            paused: false,
            pauseReason: null,
            disconnectInfo: null,
            reconnectTimeRemaining: 0,
            actions: {
                setScreen: (screen) => set({ screen }, false, "ui/setScreen"),
                setPaused: (paused, reason = null) =>
                    set({ paused, pauseReason: reason }, false, "ui/setPaused"),
                setDisconnectInfo: (info) =>
                    set({ disconnectInfo: info }, false, "ui/setDisconnectInfo"),
                setReconnectTimeRemaining: (time) =>
                    set({ reconnectTimeRemaining: time }, false, "ui/setReconnectTime"),
                clearDisconnect: () =>
                    set(
                        {
                            paused: false,
                            pauseReason: null,
                            disconnectInfo: null,
                            reconnectTimeRemaining: 0
                        },
                        false,
                        "ui/clearDisconnect"
                    )
            }
        }),
        { name: "UIStore" }
    )
);
