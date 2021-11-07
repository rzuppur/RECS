export default class Vector2 {
    public readonly x: number;
    public readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public get length(): number {
        return Math.hypot(this.x, this.y);
    }

    public get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    public normalized(): Vector2 {
        return new Vector2(this.x / length, this.y / length);
    }

    public add(v2: Vector2): Vector2 {
        const x = this.x + v2.x;
        const y = this.y + v2.y;
        return new Vector2(x, y);
    }

    public subtract(v2: Vector2): Vector2 {
        const x = this.x - v2.x;
        const y = this.y - v2.y;
        return new Vector2(x, y);
    }

    public dotProduct(v2: Vector2): number {
        return this.x * v2.x + this.y * v2.y;
    }
}
