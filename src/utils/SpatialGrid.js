/**
 * Simple spatial partitioning grid for optimizing collision checks and queries.
 * Reduces O(N*M) collision checks to O(N) by only checking nearby entities.
 */
export class SpatialGrid {
    constructor(width, height, cellSize = 100) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Array(this.cols * this.rows).fill(0).map(() => []);
    }

    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i].length = 0;
        }
    }

    insert(entity) {
        const index = this.getIndex(entity.x, entity.y);
        if (index !== -1) {
            this.grid[index].push(entity);
        }
    }

    getIndex(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return row * this.cols + col;
    }

    /**
     * Get all entities in cells overlapping the given radius.
     */
    query(x, y, radius) {
        const results = [];
        const left = Math.max(0, Math.floor((x - radius) / this.cellSize));
        const right = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
        const top = Math.max(0, Math.floor((y - radius) / this.cellSize));
        const bottom = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

        for (let r = top; r <= bottom; r++) {
            for (let c = left; c <= right; c++) {
                const index = r * this.cols + c;
                const cell = this.grid[index];
                for (let i = 0; i < cell.length; i++) {
                    results.push(cell[i]);
                }
            }
        }
        return results;
    }
}
