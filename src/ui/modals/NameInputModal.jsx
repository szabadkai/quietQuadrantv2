import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/Button.jsx";

/**
 * Modal for entering player name for leaderboard.
 * @param {Object} props
 * @param {Function} props.onSubmit - Called with the entered name
 * @param {Function} props.onClose - Called when modal is dismissed
 * @param {string} [props.initialName] - Pre-fill with existing name
 */
export function NameInputModal({ onSubmit, onClose, initialName = "" }) {
    const [name, setName] = useState(initialName);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        // Focus input on mount
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmed = name.trim();
        if (!trimmed) {
            setError("Please enter a name");
            return;
        }

        if (trimmed.length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }

        if (trimmed.length > 20) {
            setError("Name must be 20 characters or less");
            return;
        }

        // Basic profanity/spam check
        if (/^[^a-zA-Z0-9]+$/.test(trimmed)) {
            setError("Name must contain letters or numbers");
            return;
        }

        onSubmit(trimmed);
    };

    const handleChange = (e) => {
        const value = e.target.value.slice(0, 20);
        setName(value);
        if (error) setError("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            onClose?.();
        }
    };

    return (
        <div className="qq-modal-overlay" onClick={onClose}>
            <div
                className="qq-modal qq-name-input-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="qq-modal-header">
                    <span className="qq-label">ENTER YOUR CALLSIGN</span>
                    <h2>Join the Leaderboard</h2>
                    <p className="qq-muted">
                        Your name will be displayed on the global leaderboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="qq-name-form">
                    <div className="qq-input-group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="PILOT_NAME"
                            className="qq-text-input"
                            maxLength={20}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <span className="qq-char-count">{name.length}/20</span>
                    </div>

                    {error && <div className="qq-input-error">{error}</div>}

                    <div className="qq-modal-actions">
                        <Button primary type="submit">
                            Confirm
                        </Button>
                        <Button type="button" onClick={onClose}>
                            Skip
                        </Button>
                    </div>
                </form>

                <p className="qq-muted qq-small">
                    You can change your name later in Settings
                </p>
            </div>
        </div>
    );
}
