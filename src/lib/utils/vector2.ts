export default class Vector2 {
    public readonly x: number;
    public readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    public get normalized(): Vector2 {
        return new Vector2(this.x / this.length, this.y / this.length);
    }

    public get absolute(): Vector2 {
        return new Vector2(Math.abs(this.x), Math.abs(this.y));
    }

    public add(v2: Vector2): Vector2 {
        const x = this.x + v2.x;
        const y = this.y + v2.y;
        return new Vector2(x, y);
    }

    public multiply(a: number): Vector2 {
        const x = this.x * a;
        const y = this.y * a;
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

    /**
     * Returns the magnitude of the z value of the resulting 3D vector.
     */
    public crossProduct(v2: Vector2): number {
        return this.x * v2.y - this.y * v2.x;
    }

    /**
     * Element-wise multiplication
     */
    public hadamardProduct(v2: Vector2): Vector2 {
        const x = this.x * v2.x;
        const y = this.y * v2.y;
        return new Vector2(x, y);
    }
}
