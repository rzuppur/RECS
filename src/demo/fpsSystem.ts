import {Manager, Query, ScreenLocationData, System} from "../engine";
import DrawableData from "../engine/components/drawableData";
import {Entity} from "../engine/manager";

export default class FpsSystem extends System {
    private manager: Manager;

    private fpsCounter: Entity;
    private history: number[] = [];

    constructor() {
        super([]);
    }

    public initialize(query: Query, manager: Manager): boolean {
        this.manager = manager;

        this.fpsCounter = this.manager.createEntity();
        this.manager.setComponent(this.fpsCounter, "screenLocation", {
            x: 10,
            y: 30,
        } as ScreenLocationData);
        this.manager.setComponent(this.fpsCounter, "drawable", {
            type: "TEXT",
            content: "FPS: NaN",
            color: "#fff",
            size: 20,
            font: "monospace",
        } as DrawableData)

        return super.initialize(query, manager);
    }

    public tick(dt: number): void {
        if (!dt) return;

        if (this.history.length > 100) {
            this.history.shift();
        }
        this.history.push(1000 / dt);

        const avg = this.history.reduce((a, b) => (a + b)) / this.history.length;
        const min = Math.min(...this.history);
        const max = Math.max(...this.history);

        const d = this.manager.getEntities().get(this.fpsCounter).get("drawable") as DrawableData;
        d.content = `FPS: ${Math.round(avg)} (${Math.round(min)}-${Math.round(max)})`;
    }
}
