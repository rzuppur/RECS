const pool: Vector2[] = [];
let poolTotal = 0;

export default class Vector2 {
    private _x: number;
    private _y: number;

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    constructor(x: number, y: number) {
        poolTotal += 1;
        this._x = x;
        this._y = y;
    }

    public static getPoolSize(): number {
        return pool.length;
    }

    public static getPoolSizeTotal(): number {
        return poolTotal;
    }

    /**
     * Create a new Vector2, if possible reuse from pool
     */
    public static new(x: number = 0, y: number = 0): Vector2 {
        if (!pool.length) return new Vector2(x, y);
        const v = pool.pop();
        v._x = x;
        v._y = y;
        return v;
    }

    public copy(): Vector2 {
        return Vector2.new(this.x, this.y);
    }

    /**
     * Return Vector2 object to pool for reuse
     */
    public free(): void {
        pool.push(this);
    }
    /**
     * Return Vector2 object to pool for reuse, returns itself for chaining
     *
     * `example = v1.add(v2.multiply(3).release())`
     */
    public release(): Vector2 {
        pool.push(this);
        return this;
    }

    public get len(): number {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    public get angle(): number {
        return Math.atan2(this._y, this._x);
    }

    public get normalized(): Vector2 {
        const len = this.len;
        return Vector2.new(this._x / len, this._y / len);
    }

    public get absolute(): Vector2 {
        return Vector2.new(Math.abs(this._x), Math.abs(this._y));
    }

    public add(v2: Vector2): Vector2 {
        const x = this._x + v2._x;
        const y = this._y + v2._y;
        return Vector2.new(x, y);
    }

    public multiply(a: number): Vector2 {
        const x = this._x * a;
        const y = this._y * a;
        return Vector2.new(x, y);
    }

    public divide(a: number): Vector2 {
        const x = this._x / a;
        const y = this._y / a;
        return Vector2.new(x, y);
    }

    public subtract(v2: Vector2): Vector2 {
        const x = this._x - v2._x;
        const y = this._y - v2._y;
        return Vector2.new(x, y);
    }

    public dotProduct(v2: Vector2): number {
        return this._x * v2._x + this._y * v2._y;
    }

    /**
     * Returns the magnitude of the z value of the resulting 3D vector.
     */
    public crossProduct(v2: Vector2): number {
        return this._x * v2._y - this._y * v2._x;
    }

    /**
     * Element-wise multiplication
     */
    public hadamardProduct(v2: Vector2): Vector2 {
        const x = this._x * v2._x;
        const y = this._y * v2._y;
        return Vector2.new(x, y);
    }
}
