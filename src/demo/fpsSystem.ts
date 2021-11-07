import { DrawableComponent, Entity, Manager, Query, ScreenLocationComponent, System, Vector2 } from "../engine";

export class FPS extends System {
    private background: Entity;
    private fpsGraph: Entity;
    private history: number[] = [];

    constructor() {
        super("FPS", []);
    }

    public start(query: Query, manager: Manager): boolean {
        this.background = manager.createEntity();
        manager.setComponent(this.background, new ScreenLocationComponent({ loc: new Vector2(0, 0), z: 10 }));
        manager.setComponent(this.background, new DrawableComponent({ type: "RECT", color: "#6668", width: 300, height: 60 }));

        this.fpsGraph = manager.createEntity();
        manager.setComponent(this.fpsGraph, new ScreenLocationComponent({ loc: new Vector2(0, 0), z: 11 }));
        manager.setComponent(this.fpsGraph, new DrawableComponent({ type: "PATH", path: [], color: "#f92a" }));

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
        let path: Array<Array<number>> = [[0,60]];
        this.history.forEach((fps, i) => {
            path.push([i * 2, 60 - fps]);
            path.push([(i + 1) * 2, 60 - fps]);
        });
        path.push([this.history.length*2, 60]);
        pathDrawable.data.path = path;
    }
}

export function initializeFPS(manager: Manager): FPS {
    const fps = new FPS();
    manager.registerSystem(fps);

    return fps;
}
