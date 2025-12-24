import React from "react";
import { useUIStore } from "../../state/useUIStore.js";
import { Button } from "../components/Button.jsx";

export function MultiplayerSetupScreen() {
    const setScreen = useUIStore((s) => s.actions.setScreen);

    return (
        <div className="qq-screen">
            <div className="qq-panel qq-panel-narrow">
                <div className="qq-screen-header">
                    <span className="qq-label">MULTIPLAYER</span>
                    <h1>Play Together</h1>
                    <p className="qq-muted">Choose how you want to play</p>
                </div>

                <div className="qq-menu-list">
                    <Button primary onClick={() => setScreen("host")}>
            Host Online Game
                    </Button>
                    <Button onClick={() => setScreen("join")}>
            Join Online Game
                    </Button>
                    <Button onClick={() => setScreen("twin")}>
            Local Co-op
                    </Button>
                </div>

                <div className="qq-screen-actions">
                    <Button onClick={() => setScreen("title")}>
            Back to Menu
                    </Button>
                </div>
            </div>
        </div>
    );
}
