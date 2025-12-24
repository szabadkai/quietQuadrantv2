import { soundManager } from "../audio/SoundManager.js";
import { musicManager } from "../audio/MusicManager.js";
import { hasDashIntent, hasFireIntent, readGamepad } from "./gamepad.js";

const P1_MOVE = {
    left: "KeyA",
    right: "KeyD",
    up: "KeyW",
    down: "KeyS",
};

const P2_MOVE = {
    left: "ArrowLeft",
    right: "ArrowRight",
    up: "ArrowUp",
    down: "ArrowDown",
};

const P2_AIM = {
    left: ["Numpad4", "KeyJ"],
    right: ["Numpad6", "KeyL"],
    up: ["Numpad8", "KeyI"],
    down: ["Numpad2", "KeyK"],
};

const P2_FIRE = ["Numpad0", "NumpadEnter", "Enter"];
const P2_DASH = ["Numpad1", "ShiftRight"];

export class TwinInputManager {
    constructor(target = null, options = {}) {
        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false, hasPosition: false };
        this.target = null;
        this.bounds = null;
        this.audioResumed = false;
        this.p1GamepadIndex =
            options.p1GamepadIndex === undefined ? null : options.p1GamepadIndex;
        this.p2GamepadIndex =
            options.p2GamepadIndex === undefined ? 1 : options.p2GamepadIndex;
        this.p2Input = options.p2Input ?? "keyboard";

        this.handleKeyDown = (event) => {
            this.keys.add(event.code);
            this.resumeAudio();
        };

        this.handleKeyUp = (event) => {
            this.keys.delete(event.code);
        };

        this.handlePointerMove = (event) => {
            if (!this.target) return;
            const bounds = this.target.getBoundingClientRect();
            this.bounds = bounds;
            const scaleX = this.target.width / bounds.width;
            const scaleY = this.target.height / bounds.height;
            this.pointer.x = (event.clientX - bounds.left) * scaleX;
            this.pointer.y = (event.clientY - bounds.top) * scaleY;
            this.pointer.hasPosition = true;
        };

        this.handlePointerDown = (event) => {
            if (event.button !== 0) return;
            this.pointer.down = true;
            this.handlePointerMove(event);
            this.resumeAudio();
        };

        this.handlePointerUp = (event) => {
            if (event.button !== 0) return;
            this.pointer.down = false;
        };

        this.handleResize = () => {
            if (!this.target) return;
            this.bounds = this.target.getBoundingClientRect();
        };

        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("resize", this.handleResize);

        if (target) {
            this.attach(target);
        }
    }

    resumeAudio() {
        if (this.audioResumed) return;
        this.audioResumed = true;
        soundManager.resume();
        musicManager.resume();
        musicManager.play(musicManager.currentTrack ?? "level1");
    }

    attach(target) {
        this.detachPointerListeners();
        this.target = target;
        this.bounds = target.getBoundingClientRect();

        target.addEventListener("mousemove", this.handlePointerMove);
        target.addEventListener("mousedown", this.handlePointerDown);
        target.addEventListener("mouseup", this.handlePointerUp);
        target.addEventListener("mouseleave", this.handlePointerUp);
    }

    detachPointerListeners() {
        if (!this.target) return;
        this.target.removeEventListener("mousemove", this.handlePointerMove);
        this.target.removeEventListener("mousedown", this.handlePointerDown);
        this.target.removeEventListener("mouseup", this.handlePointerUp);
        this.target.removeEventListener("mouseleave", this.handlePointerUp);
    }

    destroy() {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
        window.removeEventListener("resize", this.handleResize);
        this.detachPointerListeners();
        this.target = null;
    }

    getInputs(players) {
        const inputs = {};
        const primaryPad =
            this.p1GamepadIndex === null ? null : readGamepad(this.p1GamepadIndex);
        const secondaryPad =
            this.p2Input === "gamepad" && this.p2GamepadIndex !== null
                ? readGamepad(this.p2GamepadIndex)
                : null;
        for (const player of players) {
            if (player.id === "p1") {
                inputs[player.id] = this.getInputForP1(player, primaryPad);
            } else if (player.id === "p2") {
                inputs[player.id] = this.getInputForP2(secondaryPad);
            }
        }
        return inputs;
    }

    getInputForP1(player, gamepad) {
        let moveX = this.axis(
            this.isDown(P1_MOVE.left),
            this.isDown(P1_MOVE.right)
        );
        let moveY = this.axis(
            this.isDown(P1_MOVE.up),
            this.isDown(P1_MOVE.down)
        );

        if (gamepad && (gamepad.left.x !== 0 || gamepad.left.y !== 0)) {
            moveX = gamepad.left.x;
            moveY = gamepad.left.y;
        }

        let aimX = 0;
        let aimY = 0;
        if (gamepad && gamepad.right.magnitude > 0.35) {
            aimX = gamepad.right.x;
            aimY = gamepad.right.y;
        } else if (this.pointer.hasPosition && player) {
            aimX = this.pointer.x - player.x;
            aimY = this.pointer.y - player.y;
        }

        return {
            moveX,
            moveY,
            aimX,
            aimY,
            fire:
                this.pointer.down ||
                this.isDown("Space") ||
                hasFireIntent(gamepad),
            dash:
                this.isDown("ShiftLeft") ||
                this.isDown("ShiftRight") ||
                hasDashIntent(gamepad),
        };
    }

    getInputForP2(gamepad) {
        let moveX =
            this.p2Input === "gamepad"
                ? 0
                : this.axis(this.isDown(P2_MOVE.left), this.isDown(P2_MOVE.right));
        let moveY =
            this.p2Input === "gamepad"
                ? 0
                : this.axis(this.isDown(P2_MOVE.up), this.isDown(P2_MOVE.down));

        let aimX =
            this.p2Input === "gamepad"
                ? 0
                : this.axis(this.isDownAny(P2_AIM.left), this.isDownAny(P2_AIM.right));
        let aimY =
            this.p2Input === "gamepad"
                ? 0
                : this.axis(this.isDownAny(P2_AIM.up), this.isDownAny(P2_AIM.down));

        if (gamepad && (gamepad.left.x !== 0 || gamepad.left.y !== 0)) {
            moveX = gamepad.left.x;
            moveY = gamepad.left.y;
        }

        if (gamepad && gamepad.right.magnitude > 0.35) {
            aimX = gamepad.right.x;
            aimY = gamepad.right.y;
        }

        return {
            moveX,
            moveY,
            aimX,
            aimY,
            fire:
                (this.p2Input !== "gamepad" && this.isDownAny(P2_FIRE)) ||
                hasFireIntent(gamepad),
            dash:
                (this.p2Input !== "gamepad" && this.isDownAny(P2_DASH)) ||
                hasDashIntent(gamepad),
        };
    }

    axis(negative, positive) {
        if (negative && !positive) return -1;
        if (positive && !negative) return 1;
        return 0;
    }

    isDown(code) {
        return this.keys.has(code);
    }

    isDownAny(codes) {
        return codes.some((code) => this.isDown(code));
    }
}
