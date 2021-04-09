import { DrawableComponent, Entity, Manager, PointableComponent, Query, ScreenLocationComponent, System} from "../engine";

export default class FpsSystem extends System {
    private manager: Manager;

    private background: Entity;
    private fpsCounter: Entity;
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
            width: 105,
            height: 65,
        }));
        this.manager.setComponent(this.background, new PointableComponent({
            width: 105,
            height: 65,
        }));

        this.fpsCounter = this.manager.createEntity();
        this.manager.setComponent(this.fpsCounter, new ScreenLocationComponent({
            x: 10,
            y: 30,
        }));
        this.manager.setComponent(this.fpsCounter, new DrawableComponent({
            type: "TEXT",
            content: "FPS: NaN",
            color: "#fff",
            size: 20,
            font: "monospace",
            fontWeight: 700,
        }));

        this.fpsCounterMinMax = this.manager.createEntity();
        this.manager.setComponent(this.fpsCounterMinMax, new ScreenLocationComponent({
            x: 10,
            y: 50,
        }));
        this.manager.setComponent(this.fpsCounterMinMax, new DrawableComponent({
            type: "TEXT",
            content: "min: NaN  max: NaN",
            color: "#fff",
            size: 14,
            font: "monospace",
        }));

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

        const d = this.manager.getEntityComponents(this.fpsCounter).get("Drawable") as DrawableComponent;
        d.data.content = `FPS: ${Math.round(avg)}`;

        const d2 = this.manager.getEntityComponents(this.fpsCounterMinMax).get("Drawable") as DrawableComponent;
        d2.data.content = `${Math.round(min)} - ${Math.round(max)}`;

        const bD = this.manager.getEntityComponents(this.background).get("Drawable") as DrawableComponent;
        const bP = this.manager.getEntityComponents(this.background).get("Pointable") as PointableComponent;
        bD.data.alpha = bP.data.hovered ? 1 : 0.7;
        if (bP.data.clicked) {
            bD.data.color = `#${Math.ceil(Math.random()*9)}${Math.ceil(Math.random()*9)}${Math.ceil(Math.random()*9)}`;
        }
    }
}
