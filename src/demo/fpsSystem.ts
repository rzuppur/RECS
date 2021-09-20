import { DrawableComponent, Entity, Manager, Query, ScreenLocationComponent, System } from "../engine";

export class FPS extends System {
    private background: Entity;
    private fpsGraph: Entity;
    private history: number[] = [];

    constructor() {
        super("FPS", []);
    }

    public start(query: Query, manager: Manager): boolean {
        this.background = manager.createEntity();
        manager.setComponent(this.background, new ScreenLocationComponent({ x: 0, y: 0, z: 10 }));
        manager.setComponent(this.background, new DrawableComponent({ type: "RECT", color: "#6668", width: 300, height: 60 }));

        this.fpsGraph = manager.createEntity();
        manager.setComponent(this.fpsGraph, new ScreenLocationComponent({ x: 0, y: 0, z: 11 }));
        manager.setComponent(this.fpsGraph, new DrawableComponent({ type: "PATH", path: [[0, 0]], strokeColor: "#ff9525" }));

        return super.start(query, manager);
    }

    public tick(dt: number, manager: Manager): void {
        if (!dt) return;

        if (this.history.length > 150) {
            this.history.shift();
        }
        this.history.push(1000 / dt);

        const avg = this.history.reduce((a, b) => (a + b)) / this.history.length;

        const pathDrawable = manager.getEntityComponents(this.fpsGraph).get("Drawable") as DrawableComponent;
        let path: Array<Array<number>> = [];
        this.history.forEach((fps, i) => {
            path.push([i * 2, 60 - fps]);
            path.push([(i + 1) * 2, 60 - fps]);
        });
        pathDrawable.data.path = path;
    }
}

export function initializeFPS(manager: Manager): FPS {
    const fps = new FPS();
    manager.registerSystem(fps);

    return fps;
}
