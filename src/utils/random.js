export class SeededRandom {
    constructor(seed = 1) {
        this.seed = seed >>> 0;
    }

    next() {
        this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
        return this.seed / 0x100000000;
    }

    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    nextRange(min, max) {
        return this.next() * (max - min) + min;
    }

    pick(list) {
        if (!list.length) return null;
        return list[Math.floor(this.next() * list.length)];
    }
}
