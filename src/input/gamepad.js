import { getVirtualGamepad } from "./virtualGamepad.js";

const AXIS_DEADZONE = 0.2;
const FIRE_THRESHOLD = 0.35;

function applyDeadzone(value, deadzone = AXIS_DEADZONE) {
    if (Math.abs(value) < deadzone) return 0;
    return value;
}

function normalizeAxisPair(x, y) {
    const dx = applyDeadzone(x);
    const dy = applyDeadzone(y);
    const magnitude = Math.hypot(dx, dy);
    return { x: dx, y: dy, magnitude };
}

export function readGamepad(index = 0) {
    const virtualPad = getVirtualGamepad(index);
    if (virtualPad) return virtualPad;

    if (typeof navigator === "undefined" || !navigator.getGamepads) {
        return null;
    }

    const pads = navigator.getGamepads();
    const pad = pads?.[index];
    if (!pad || !pad.connected) return null;

    const buttons = pad.buttons ?? [];

    const left = normalizeAxisPair(pad.axes?.[0] ?? 0, pad.axes?.[1] ?? 0);
    const right = normalizeAxisPair(pad.axes?.[2] ?? 0, pad.axes?.[3] ?? 0);

    const toValue = (btn) => {
        if (!btn) return 0;
        if (typeof btn.value === "number") return btn.value;
        return btn.pressed ? 1 : 0;
    };

    return {
        index: pad.index,
        left,
        right,
        buttons: {
            south: buttons[0]?.pressed ?? false,
            east: buttons[1]?.pressed ?? false,
            west: buttons[2]?.pressed ?? false,
            north: buttons[3]?.pressed ?? false,
            leftShoulder: buttons[4]?.pressed ?? false,
            rightShoulder: buttons[5]?.pressed ?? false,
            leftTrigger: toValue(buttons[6]),
            rightTrigger: toValue(buttons[7]),
            back: buttons[8]?.pressed ?? false,
            start: buttons[9]?.pressed ?? false,
            dpadUp: buttons[12]?.pressed ?? false,
            dpadDown: buttons[13]?.pressed ?? false,
            dpadLeft: buttons[14]?.pressed ?? false,
            dpadRight: buttons[15]?.pressed ?? false
        }
    };
}

export function hasFireIntent(gamepad) {
    if (!gamepad) return false;
    return (
        gamepad.right.magnitude > FIRE_THRESHOLD ||
    gamepad.buttons.rightTrigger > FIRE_THRESHOLD ||
    gamepad.buttons.rightShoulder ||
    gamepad.buttons.south
    );
}


export function hasDashIntent(gamepad) {
    if (!gamepad) return false;
    return (
        gamepad.buttons.leftTrigger > FIRE_THRESHOLD ||
        gamepad.buttons.leftShoulder ||
        gamepad.buttons.east
    );
}

export function getAnyGamepad() {
    // Check virtual pads first
    for (let i = 0; i < 4; i++) {
        const vp = getVirtualGamepad(i);
        if (vp) return vp;
    }

    if (typeof navigator === "undefined" || !navigator.getGamepads) {
        return null;
    }

    const pads = navigator.getGamepads();
    for (let i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) {
            return readGamepad(pads[i].index);
        }
    }
    return null;
}
