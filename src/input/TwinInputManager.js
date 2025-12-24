import { soundManager } from "../audio/SoundManager.js";
import { musicManager } from "../audio/MusicManager.js";

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
    constructor(target = null) {
        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false, hasPosition: false };
        this.target = null;
        this.bounds = null;
        this.audioResumed = false;

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
        for (const player of players) {
            if (player.id === "p1") {
                inputs[player.id] = this.getInputForP1(player);
            } else if (player.id === "p2") {
                inputs[player.id] = this.getInputForP2();
            }
        }
        return inputs;
    }

    getInputForP1(player) {
        const moveX = this.axis(
            this.isDown(P1_MOVE.left),
            this.isDown(P1_MOVE.right)
        );
        const moveY = this.axis(
            this.isDown(P1_MOVE.up),
            this.isDown(P1_MOVE.down)
        );

        let aimX = 0;
        let aimY = 0;
        if (this.pointer.hasPosition && player) {
            aimX = this.pointer.x - player.x;
            aimY = this.pointer.y - player.y;
        }

        return {
            moveX,
            moveY,
            aimX,
            aimY,
            fire: this.pointer.down || this.isDown("Space"),
            dash: this.isDown("ShiftLeft") || this.isDown("ShiftRight"),
        };
    }

    getInputForP2() {
        const moveX = this.axis(
            this.isDown(P2_MOVE.left),
            this.isDown(P2_MOVE.right)
        );
        const moveY = this.axis(
            this.isDown(P2_MOVE.up),
            this.isDown(P2_MOVE.down)
        );

        const aimX = this.axis(
            this.isDownAny(P2_AIM.left),
            this.isDownAny(P2_AIM.right)
        );
        const aimY = this.axis(
            this.isDownAny(P2_AIM.up),
            this.isDownAny(P2_AIM.down)
        );

        return {
            moveX,
            moveY,
            aimX,
            aimY,
            fire: this.isDownAny(P2_FIRE),
            dash: this.isDownAny(P2_DASH),
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
