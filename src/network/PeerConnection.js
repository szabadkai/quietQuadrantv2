export class PeerConnection {
    constructor(id) {
        this.id = id;
        this.connectedAt = Date.now();
        this.lastSeenAt = this.connectedAt;
    }

    markSeen() {
        this.lastSeenAt = Date.now();
    }
}
