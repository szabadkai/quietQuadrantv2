const virtualPads = new Map();

export function setVirtualGamepad(index, pad) {
    if (pad) {
        virtualPads.set(index, pad);
    }
}

export function clearVirtualGamepad(index) {
    virtualPads.delete(index);
}

export function getVirtualGamepad(index) {
    return virtualPads.get(index) ?? null;
}
