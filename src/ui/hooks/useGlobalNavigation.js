import { useEffect, useRef } from "react";
import { getAnyGamepad } from "../../input/gamepad.js";
import {
    activateElement,
    findScrollable,
    focusAndReveal,
    getActiveScope,
    getFocusable,
} from "./navUtils.js";

const NAV_REPEAT_MS = 120;
const NAV_AXIS_THRESHOLD = 0.5;
const FIRE_THRESHOLD = 0.35;

function findBackTarget(scope) {
    if (!scope) return null;
    const explicit = scope.querySelector("[data-nav-back]");
    if (explicit) return explicit;

    const candidates = Array.from(scope.querySelectorAll("button, [role='button']"));
    return (
        candidates.find((el) => /back|close|cancel/i.test(el.textContent ?? "")) ||
        null
    );
}

export function useGlobalNavigation() {
    const navRef = useRef({
        focusIndex: 0,
        lastMoveAt: 0,
        lastAxisDir: 0,
        lastActivate: false,
        lastBack: false,
        lastSliderDir: 0,
        lastSliderAt: 0,
        lastScope: null,
    });

    const adjustSlider = (slider, delta) => {
        if (!slider) return;
        const min = parseFloat(slider.min ?? 0);
        const max = parseFloat(slider.max ?? 1);
        const step = parseFloat(slider.step ?? 1);
        const current = parseFloat(slider.value ?? 0);
        const next = Math.min(max, Math.max(min, current + delta * step));
        if (next === current) return;
        slider.value = next;
        slider.dispatchEvent(new Event("input", { bubbles: true }));
    };

    useEffect(() => {
        if (typeof document === "undefined" || typeof window === "undefined") {
            return undefined;
        }

        const handleKeyDown = (e) => {
            const scope = getActiveScope();
            const focusable = getFocusable(scope);
            if (!scope || focusable.length === 0) return;

            const targetTag = e.target?.tagName;
            const isFormField =
                targetTag === "INPUT" || targetTag === "TEXTAREA" || targetTag === "SELECT";
            const isSliderInput =
                targetTag === "INPUT" && e.target?.getAttribute("type") === "range";
            const allowNavFromSlider =
                isSliderInput &&
                (e.key === "ArrowUp" ||
                    e.key === "ArrowDown" ||
                    e.key === "KeyW" ||
                    e.key === "KeyS");

            if (isFormField && e.key !== "Escape" && !allowNavFromSlider) {
                return;
            }

            const move = (delta) => {
                if (focusable.length <= 1) {
                    const scrollable = findScrollable(scope);
                    if (scrollable) {
                        scrollable.scrollBy({ top: delta * 80, behavior: "smooth" });
                    }
                    return;
                }

                const nextIndex =
                    (navRef.current.focusIndex + delta + focusable.length) % focusable.length;
                navRef.current.focusIndex = nextIndex;
                focusAndReveal(focusable[nextIndex]);
            };

            switch (e.key) {
            case "ArrowUp":
            case "KeyW":
                e.preventDefault();
                move(-1);
                break;
            case "ArrowDown":
            case "KeyS":
                e.preventDefault();
                move(1);
                break;
            case "ArrowLeft":
            case "KeyA":
                if (!isFormField) {
                    e.preventDefault();
                    move(-1);
                }
                break;
            case "ArrowRight":
            case "KeyD":
                if (!isFormField) {
                    e.preventDefault();
                    move(1);
                }
                break;
            case "Enter":
            case " ":
                if (!isFormField) {
                    e.preventDefault();
                    activateElement(focusable[navRef.current.focusIndex]);
                }
                break;
            case "Escape": {
                const backTarget = findBackTarget(scope);
                if (backTarget) {
                    e.preventDefault();
                    activateElement(backTarget);
                }
                break;
            }
            default:
                break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        let rafId;
        const tick = () => {
            const scope = getActiveScope();
            const focusable = getFocusable(scope);
            const now = performance.now();

            if (scope !== navRef.current.lastScope) {
                navRef.current.lastScope = scope;
                navRef.current.focusIndex = 0;
                // Prevent immediate activation if button is held during transition
                navRef.current.lastActivate = true;
                navRef.current.lastBack = true;
            }

            if (scope && focusable.length > 0) {
                const currentIndex = Math.min(
                    navRef.current.focusIndex,
                    focusable.length - 1
                );
                if (document.activeElement !== focusable[currentIndex]) {
                    focusAndReveal(focusable[currentIndex]);
                }

                const pad = getAnyGamepad();
                if (pad) {
                    const horizontalDir =
                        pad.buttons.dpadRight || pad.left.x > NAV_AXIS_THRESHOLD
                            ? 1
                            : pad.buttons.dpadLeft || pad.left.x < -NAV_AXIS_THRESHOLD
                                ? -1
                                : 0;
                    const verticalDir =
                        pad.buttons.dpadDown || pad.left.y > NAV_AXIS_THRESHOLD
                            ? 1
                            : pad.buttons.dpadUp || pad.left.y < -NAV_AXIS_THRESHOLD
                                ? -1
                                : 0;

                    const activeEl = document.activeElement;
                    const isSlider =
                        activeEl?.tagName === "INPUT" &&
                        activeEl.getAttribute("type") === "range";

                    if (isSlider && horizontalDir) {
                        if (
                            horizontalDir !== navRef.current.lastSliderDir ||
                            now - navRef.current.lastSliderAt > NAV_REPEAT_MS
                        ) {
                            navRef.current.lastSliderDir = horizontalDir;
                            navRef.current.lastSliderAt = now;
                            adjustSlider(activeEl, horizontalDir);
                        }
                    } else if (!horizontalDir) {
                        navRef.current.lastSliderDir = 0;
                    }

                    const navDir =
                        verticalDir ||
                        (!isSlider && horizontalDir ? horizontalDir : 0);

                    if (
                        navDir !== 0 &&
                        (navDir !== navRef.current.lastAxisDir ||
                            now - navRef.current.lastMoveAt > NAV_REPEAT_MS)
                    ) {
                        navRef.current.lastAxisDir = navDir;
                        navRef.current.lastMoveAt = now;
                        if (focusable.length <= 1) {
                            const scrollable = findScrollable(scope);
                            if (scrollable) {
                                scrollable.scrollBy({ top: navDir * 80, behavior: "smooth" });
                            }
                        } else {
                            const nextIndex =
                                (currentIndex + navDir + focusable.length) %
                                focusable.length;
                            navRef.current.focusIndex = nextIndex;
                            focusAndReveal(focusable[nextIndex]);
                        }
                    } else if (!navDir) {
                        navRef.current.lastAxisDir = 0;
                    }

                    const backIntent = pad.buttons.back || pad.buttons.east;
                    if (backIntent) {
                        if (!navRef.current.lastBack) {
                            const backTarget = findBackTarget(scope);
                            if (backTarget) {
                                activateElement(backTarget);
                            }
                        }
                        navRef.current.lastBack = true;
                    } else if (
                        pad.buttons.south ||
                        pad.buttons.rightShoulder ||
                        pad.buttons.rightTrigger > FIRE_THRESHOLD
                    ) {
                        if (!navRef.current.lastActivate) {
                            activateElement(focusable[navRef.current.focusIndex]);
                        }
                        navRef.current.lastActivate = true;
                    } else {
                        navRef.current.lastActivate = false;
                        navRef.current.lastBack = false;
                    }
                } else {
                    navRef.current.lastActivate = false;
                    navRef.current.lastBack = false;
                    navRef.current.lastSliderDir = 0;
                }
            } else {
                navRef.current.focusIndex = 0;
            }

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);
}
