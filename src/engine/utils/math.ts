export const clamp = (min: number, value: number, max: number): number => {
    return Math.min(max, Math.max(min, value));
};

export type InterpolateType = "NEAREST" | "LINEAR" | "EASE";

export class InterpolatedValue {
    private currentValue: number;
    private from: number;
    private to: number;
    private percentage: number = 1;
    private interpolateStep: number;
    private type : InterpolateType;

    public onComplete: () => void = () => {};

    /**
     * Get the current value without changing it
     */
    public get value(): number {
        return this.currentValue;
    }

    /**
     * Returns true if value is currently being interpolated
     */
    public get easing(): boolean {
        return this.percentage < 1;
    }

    /**
     * todo: hard-coded 60fps, animations might be too fast on high refresh rate displays
     * @param speed - set easing time in ms, assumes game is running at 60 fps
     */
    public set speed_ms(speed: number) {
        this.interpolateStep = Math.max(16.66 / speed, 0);
    }

    constructor(value: number, type: InterpolateType = "EASE", speed_ms: number = 1000) {
        this.type = type;
        this.speed_ms = speed_ms;
        this.setInstantly(value);
    }

    /**
     * Changes value to target instantly without interpolating
     */
    public setInstantly(value: number): void {
        this.percentage = 1;
        this.currentValue = value;
    }

    /**
     * Starts interpolating towards the target from current value
     */
    public setInterpolate(value: number): void {
        this.percentage = 0;
        this.from = this.currentValue;
        this.to = value;
    }

    /**
     * Update value by one increment if needed and get the current value.
     * This should be called every game tick for 60fps animations.
     */
    public get(): number {
        if (this.percentage < 1) {
            this.percentage += this.interpolateStep;

            if (this.percentage >= 1) {
                this.currentValue = this.to;
                this.onComplete();
            } else {
                const delta = this.to - this.from;
                if (this.type === "NEAREST") {
                    this.currentValue = this.percentage < 0.5 ? this.from : this.to;
                }
                if (this.type === "LINEAR") {
                    this.currentValue = this.from + delta * this.percentage;
                }
                if (this.type === "EASE") {
                    const position = this.percentage * this.percentage * (3 - (2 * this.percentage));
                    this.currentValue = this.from + delta * position;
                }
            }
        }
        return this.currentValue;
    }
}
