import { useState, useEffect, useCallback } from "react";
import { soundManager } from "../../audio/SoundManager.js";

/**
 * Hook for keyboard/gamepad menu navigation.
 * @param {Array} items - Array of { ref, onActivate, onAdjust?, disabled? }
 * @param {Object} options - { enabled, columns, onBack, loop }
 */
export function useMenuNavigation(items, options = {}) {
    const { enabled = true, columns = 1, onBack, loop = true } = options;
    const [focusedIndex, setFocusedIndex] = useState(0);

    const findNextEnabled = useCallback(
        (start, direction) => {
            const len = items.length;
            let index = start;
            for (let i = 0; i < len; i++) {
                index = (index + direction + len) % len;
                if (!items[index]?.disabled) return index;
                if (!loop && (index === 0 || index === len - 1)) return start;
            }
            return start;
        },
        [items, loop]
    );

    const setFocusedIndexWithSound = useCallback((newIndex) => {
        setFocusedIndex((prevIndex) => {
            const nextIndex =
                typeof newIndex === "function" ? newIndex(prevIndex) : newIndex;
            if (nextIndex !== prevIndex) {
                soundManager.play("menuHover");
            }
            return nextIndex;
        });
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e) => {
            const current = items[focusedIndex];

            switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                if (columns === 1) {
                    setFocusedIndexWithSound((i) => findNextEnabled(i, -1));
                } else {
                    const newIdx = focusedIndex - columns;
                    if (newIdx >= 0 || loop) {
                        setFocusedIndexWithSound(
                            findNextEnabled(focusedIndex, -columns)
                        );
                    }
                }
                break;

            case "ArrowDown":
                e.preventDefault();
                if (columns === 1) {
                    setFocusedIndexWithSound((i) => findNextEnabled(i, 1));
                } else {
                    const newIdx = focusedIndex + columns;
                    if (newIdx < items.length || loop) {
                        setFocusedIndexWithSound(
                            findNextEnabled(focusedIndex, columns)
                        );
                    }
                }
                break;

            case "ArrowLeft":
                e.preventDefault();
                if (current?.onAdjust) {
                    current.onAdjust(-1);
                } else if (columns > 1) {
                    setFocusedIndexWithSound((i) => findNextEnabled(i, -1));
                }
                break;

            case "ArrowRight":
                e.preventDefault();
                if (current?.onAdjust) {
                    current.onAdjust(1);
                } else if (columns > 1) {
                    setFocusedIndexWithSound((i) => findNextEnabled(i, 1));
                }
                break;

            case "Enter":
            case " ":
                e.preventDefault();
                if (current?.onActivate && !current.disabled) {
                    soundManager.play("menuSelect");
                    current.onActivate();
                }
                break;

            case "Escape":
                e.preventDefault();
                if (onBack) onBack();
                break;

            case "1":
            case "2":
            case "3":
                const quickIdx = parseInt(e.key, 10) - 1;
                if (quickIdx < items.length && !items[quickIdx]?.disabled) {
                    setFocusedIndexWithSound(quickIdx);
                    soundManager.play("menuSelect");
                    items[quickIdx]?.onActivate?.();
                }
                break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        enabled,
        items,
        focusedIndex,
        columns,
        onBack,
        loop,
        findNextEnabled,
        setFocusedIndexWithSound,
    ]);

    useEffect(() => {
        if (items[focusedIndex]?.disabled) {
            setFocusedIndex(findNextEnabled(focusedIndex, 1));
        }
    }, [items, focusedIndex, findNextEnabled]);

    return { focusedIndex, setFocusedIndex };
}
