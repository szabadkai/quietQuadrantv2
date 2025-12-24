import { soundManager } from "../audio/SoundManager.js";
import { musicManager } from "../audio/MusicManager.js";
import { hasDashIntent, hasFireIntent, readGamepad } from "./gamepad.js";

const MOVE_KEYS = new Set([
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowLeft",
    "ArrowDown",
    "ArrowRight",
]);

const FIRE_STICK_THRESHOLD = 0.35;

export class InputManager {
    constructor(target = null) {
        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false, hasPosition: false };
        this.target = null;
        this.bounds = null;
        this.audioResumed = false;
        this.gamepadIndex = 0;

        this.handleKeyDown = (event) => {
            if (MOVE_KEYS.has(event.code)) {
                event.preventDefault();
            }
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

    getInputForPlayer(player) {
        const gamepad = readGamepad(this.gamepadIndex);

        let moveX = this.axis(
            this.isDown("KeyA") || this.isDown("ArrowLeft"),
            this.isDown("KeyD") || this.isDown("ArrowRight")
        );
        let moveY = this.axis(
            this.isDown("KeyW") || this.isDown("ArrowUp"),
            this.isDown("KeyS") || this.isDown("ArrowDown")
        );

        if (gamepad) {
            if (gamepad.left.x !== 0 || gamepad.left.y !== 0) {
                moveX = gamepad.left.x;
                moveY = gamepad.left.y;
            }
        }

        let aimX = 0;
        let aimY = 0;
        if (gamepad && gamepad.right.magnitude > FIRE_STICK_THRESHOLD) {
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

    axis(negative, positive) {
        if (negative && !positive) return -1;
        if (positive && !negative) return 1;
        return 0;
    }

    isDown(code) {
        return this.keys.has(code);
    }
}
