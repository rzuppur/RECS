import { Engine, DrawableComponent, WorldLocationComponent, Manager, DisplaySystem } from "../engine";
import Logger from "../engine/utils/logger";

import FpsSystem from "./fpsSystem";

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
            if (Math.random() > 0.95) {
                this.manager.setComponent(entity, new DrawableComponent({
                    type: "TEXT",
                    content: "Text",
                    color: `#${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}`,
                }));
            } else {
                const stroked = Math.random() > 0.5;
                this.manager.setComponent(entity, new DrawableComponent({
                    type: "RECT",
                    width: Math.random() * 15,
                    height: Math.random() * 15,
                    color: stroked ? undefined : `#${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}`,
                    strokeColor: stroked ? `#${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}` : undefined,
                    strokeWidth: Math.random() * 3,
                }));
            }
        }
        const text = this.manager.createEntity();
        this.manager.setComponent(text, new WorldLocationComponent({
            x: 40,
            y: 200,
            z: -1,
        }));
        this.manager.setComponent(text, new DrawableComponent({
            type: "TEXT",
            content: "Big\ntext",
            color: "#ccc",
            size: 140,
            font: "serif",
            fontWeight: 700,
        }));

        log.info(`${n} created`);
    }
}

const start = () => {
    console.time("init");
    const game = new Game();
    console.timeEnd("init");
}

start();
