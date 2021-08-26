import { DrawableComponent, Entity, Manager, PointableComponent, Query, ScreenLocationComponent, System } from "../engine";

export default class FpsSystem extends System {
    private background: Entity;
    private fpsCounter: Entity;
    private fpsGraph: Entity;
    private history: number[] = [];

    constructor() {
        super("Fps", []);
    }

    public start(query: Query, manager: Manager): boolean {
        this.background = manager.createEntity();
        manager.setComponent(this.background, new ScreenLocationComponent({
            x: 0,
            y: 0,
        }));
        manager.setComponent(this.background, new DrawableComponent({
            type: "RECT",
            color: "#444",
            width: 325,
            height: 72,
        }));
        manager.setComponent(this.background, new PointableComponent({
            width: 325,
            height: 72,
        }));

        this.fpsCounter = manager.createEntity();
        manager.setComponent(this.fpsCounter, new ScreenLocationComponent({
            x: 10,
            y: 30,
            z: 10,
        }));
        manager.setComponent(this.fpsCounter, new DrawableComponent({
            type: "TEXT",
            content: "",
            color: "#fff",
            size: 20,
            font: "monospace",
            fontWeight: 700,
        }));

        this.fpsGraph = manager.createEntity();
        manager.setComponent(this.fpsGraph, new ScreenLocationComponent({
            x: 100,
            y: 30,
            z: 10,
        }));
        manager.setComponent(this.fpsGraph, new DrawableComponent({
            type: "PATH",
            path: "0 60",
            strokeColor: "#fd4"
        }));
        const fpsGraphLine = manager.createEntity();
        manager.setComponent(fpsGraphLine, new ScreenLocationComponent({
            x: 125,
            y: 30,
            z: 5,
        }));
        manager.setComponent(fpsGraphLine, new DrawableComponent({
            type: "PATH",
            path: "200 0",
            strokeColor: "#a33"
        }));

        return super.start(query, manager);
    }

    public tick(dt: number, manager: Manager): void {
        if (!dt) return;

        if (this.history.length > 100) {
            this.history.shift();
        }
        this.history.push(1000 / dt);

        const avg = this.history.reduce((a, b) => (a + b)) / this.history.length;
        const min = Math.min(...this.history);
        const max = Math.max(...this.history);

        const pathDrawable = manager.getEntityComponents(this.fpsGraph).get("Drawable") as DrawableComponent;
        let path = "";
        this.history.forEach((fps, i) => {
           path += `${i*2} ${60 - fps},${(i+1)*2} ${60 - fps},`;
        });
        pathDrawable.data.path = path;

        const d = manager.getEntityComponents(this.fpsCounter).get("Drawable") as DrawableComponent;
        d.data.content = `FPS: ${Math.round(avg)}\n${Math.round(1000 / dt).toString().padStart(7, " ")}`;
    }
}
