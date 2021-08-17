import { DrawableComponent, Entity, Manager, PointableComponent, Query, ScreenLocationComponent, System } from "../engine";

export default class FpsSystem extends System {
    private manager: Manager;

    private background: Entity;
    private fpsCounter: Entity;
    private fpsGraph: Entity;
    private fpsCounterMinMax: Entity;
    private history: number[] = [];

    constructor() {
        super("Fps", []);
    }

    public initialize(query: Query, manager: Manager): boolean {
        this.manager = manager;

        this.background = this.manager.createEntity();
        this.manager.setComponent(this.background, new ScreenLocationComponent({
            x: 0,
            y: 0,
        }));
        this.manager.setComponent(this.background, new DrawableComponent({
            type: "RECT",
            color: "#444",
            width: 260,
            height: 72,
        }));
        this.manager.setComponent(this.background, new PointableComponent({
            width: 260,
            height: 72,
        }));

        this.fpsCounter = this.manager.createEntity();
        this.manager.setComponent(this.fpsCounter, new ScreenLocationComponent({
            x: 10,
            y: 30,
            z: 10,
        }));
        this.manager.setComponent(this.fpsCounter, new DrawableComponent({
            type: "TEXT",
            content: "FPS: NaN",
            color: "#fff",
            size: 20,
            font: "monospace",
            fontWeight: 700,
        }));

        this.fpsGraph = this.manager.createEntity();
        this.manager.setComponent(this.fpsGraph, new ScreenLocationComponent({
            x: 125,
            y: 30,
            z: 10,
        }));
        this.manager.setComponent(this.fpsGraph, new DrawableComponent({
            type: "PATH",
            path: "0 60",
            strokeColor: "#fd4"
        }));
        const fpsGraphLine = this.manager.createEntity();
        this.manager.setComponent(fpsGraphLine, new ScreenLocationComponent({
            x: 125,
            y: 30,
            z: 5,
        }));
        this.manager.setComponent(fpsGraphLine, new DrawableComponent({
            type: "PATH",
            path: "200 0",
            strokeColor: "#a33"
        }));

        this.fpsCounterMinMax = this.manager.createEntity();
        this.manager.setComponent(this.fpsCounterMinMax, new ScreenLocationComponent({
            x: 10,
            y: 50,
            z: 10,
        }));
        this.manager.setComponent(this.fpsCounterMinMax, new DrawableComponent({
            type: "TEXT",
            content: "min: max:",
            color: "#aaa",
            size: 14,
            font: "monospace",
        }));

        return super.initialize(query, manager);
    }

    public tick(dt: number): void {
        if (!dt) return;

        if (this.history.length > 200) {
            this.history.shift();
        }
        this.history.push(1000 / dt);

        const avg = this.history.reduce((a, b) => (a + b)) / this.history.length;
        const min = Math.min(...this.history);
        const max = Math.max(...this.history);

        const pathDrawable = this.manager.getEntityComponents(this.fpsGraph).get("Drawable") as DrawableComponent;
        let path = "";
        this.history.forEach((fps, i) => {
           path += `${i} ${60 - fps},`;
        });
        pathDrawable.data.path = path;

        const d = this.manager.getEntityComponents(this.fpsCounter).get("Drawable") as DrawableComponent;
        d.data.content = `FPS: ${Math.round(avg)}`;

        const d2 = this.manager.getEntityComponents(this.fpsCounterMinMax).get("Drawable") as DrawableComponent;
        d2.data.content = `${Math.round(min)} - ${Math.round(max)}`;
    }
}
