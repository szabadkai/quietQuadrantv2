export const EMPTY_INPUT = {
    moveX: 0,
    moveY: 0,
    aimX: 0,
    aimY: 0,
    fire: false,
    dash: false
};

export function encodeInput(input, tick) {
    return {
        t: tick,
        mx: input.moveX ?? 0,
        my: input.moveY ?? 0,
        ax: Math.round(input.aimX ?? 0),
        ay: Math.round(input.aimY ?? 0),
        f: input.fire ? 1 : 0,
        d: input.dash ? 1 : 0
    };
}

export function decodeInput(packet) {
    if (!packet) return { ...EMPTY_INPUT };
    return {
        moveX: packet.mx ?? 0,
        moveY: packet.my ?? 0,
        aimX: packet.ax ?? 0,
        aimY: packet.ay ?? 0,
        fire: !!packet.f,
        dash: !!packet.d
    };
}
