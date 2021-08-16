import { DisplaySystem, DrawableComponent, Engine, Manager, System, WorldLocationComponent } from "../engine";
import Logger from "../engine/utils/logger";

import FpsSystem from "./fpsSystem";
import PointableComponent from "../engine/components/pointable";

const log = new Logger("Game");

class Game {
    private readonly engine: Engine;
    private readonly manager: Manager;

    constructor() {
        log.new();
        this.engine = new Engine("#game");
        this.manager = this.engine.manager;

        const displaySystem = this.manager.getSystem("Display") as DisplaySystem;

        this.debugWorld();

        const fpsSystem = new FpsSystem();
        this.manager.registerSystem(fpsSystem);
        const colorSystem = new ColorChangeOnClick();
        this.manager.registerSystem(colorSystem);
    }

    private debugWorld(): void {
        const n = 1000;
        const ds = this.manager.getSystem("Display") as DisplaySystem;
        const { width, height } = ds.getSize();

        log.info(`creating ${n}`);
        for (let i = 0; i < n; i++) {
            const entity = this.manager.createEntity();
            this.manager.setComponent(entity, new WorldLocationComponent({
                x: Math.random() * width,
                y: Math.random() * height,
            }));
            this.manager.setComponent(entity, new DrawableComponent({
                type: "RECT",
                width: 25,
                height: 25,
                color: "#333",
            }));
            this.manager.setComponent(entity, new PointableComponent({
                width: 25,
                height: 25,
            }));
        }

        log.info(`${n} created`);
    }
}

class ColorChangeOnClick extends System {
    constructor() {
        super("ColorChangeOnClick", ["Pointable", "Drawable"]);
    }

    tick(dt: number) {
        this.query.getMatching().forEach((components, entity) => {
            const p = components.get("Pointable") as PointableComponent;
            const d = components.get("Drawable") as DrawableComponent;
            d.data.alpha = p.data.hovered ? 1 : 0.6;
            if (p.data.clicked) {
                d.data.color = `#${Math.ceil(Math.random() * 9)}${Math.ceil(Math.random() * 9)}${Math.ceil(Math.random() * 9)}`;
            }
        });
    }
}

const start = () => {
    console.time("init");
    const game = new Game();
    console.timeEnd("init");
}

start();
