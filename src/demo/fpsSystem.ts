import {Manager, PointableData, Query, ScreenLocationData, System} from "../engine";
import DrawableData from "../engine/components/drawableData";
import {Entity} from "../engine/manager";

export default class FpsSystem extends System {
    private manager: Manager;

    private background: Entity;
    private fpsCounter: Entity;
    private fpsCounterMinMax: Entity;
    private history: number[] = [];

    constructor() {
        super([]);
    }

    public initialize(query: Query, manager: Manager): boolean {
        this.manager = manager;

        this.background = this.manager.createEntity();
        this.manager.setComponent(this.background, "screenLocation", {
            x: 0,
            y: 0,
        } as ScreenLocationData);
        this.manager.setComponent(this.background, "drawable", {
            type: "RECT",
            color: "#444",
            alpha: 0.8,
            width: 105,
            height: 65,
        } as DrawableData);
        this.manager.setComponent(this.background, "pointable", {
            width: 105,
            height: 65,
        } as DrawableData);

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
            fontWeight: 700,
        } as DrawableData);

        this.fpsCounterMinMax = this.manager.createEntity();
        this.manager.setComponent(this.fpsCounterMinMax, "screenLocation", {
            x: 10,
            y: 50,
        } as ScreenLocationData);
        this.manager.setComponent(this.fpsCounterMinMax, "drawable", {
            type: "TEXT",
            content: "min: NaN  max: NaN",
            color: "#fff",
            size: 14,
            font: "monospace",
        } as DrawableData);

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

        const d = this.manager.getEntityComponents(this.fpsCounter).get("drawable") as DrawableData;
        d.content = `FPS: ${Math.round(avg)}`;

        const d2 = this.manager.getEntityComponents(this.fpsCounterMinMax).get("drawable") as DrawableData;
        d2.content = `${Math.round(min)} - ${Math.round(max)}`;

        const bD = this.manager.getEntityComponents(this.background).get("drawable") as DrawableData;
        const bP = this.manager.getEntityComponents(this.background).get("pointable") as PointableData;
        if (bP.clicked) {
            bD.color = `#${Math.ceil(Math.random()*9)}${Math.ceil(Math.random()*9)}${Math.ceil(Math.random()*9)}`;
        }
    }
}
