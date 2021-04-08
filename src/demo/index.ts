import { Engine } from "../engine";
import Manager from "../engine/manager";
import WorldLocationData from "../engine/components/worldLocationData";
import DrawableData from "../engine/components/drawableData";
import DisplaySystem from "../engine/systems/display/index";
import Logger from "../engine/utils/logger";

const log = new Logger("Game");

class Game {
    private readonly engine: Engine;
    private readonly manager: Manager;

    constructor() {
        log.new();
        this.engine = new Engine();
        this.manager = this.engine.manager;

        const displaySystem = this.manager.getSystem("display") as DisplaySystem;
        this.debugPerformance();
    }

    private debugPerformance(): void {
        const n = 1000;
        const ds = this.manager.getSystem("display") as DisplaySystem;
        const {width, height} = ds.getSize();

        log.info(`creating ${n}`);
        for (let i = 0; i < n; i++) {
            const entity = this.manager.createEntity();
            this.manager.setComponent(entity, "worldLocation", {
                x: Math.random() * width,
                y: Math.random() * height,
            } as WorldLocationData);
            if (Math.random() > 0.95) {
                this.manager.setComponent(entity, "drawable", {
                    type: "TEXT",
                    content: "Text",
                    color: `#${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}`,
                } as DrawableData);
            } else {
                const stroked = Math.random() > 0.5;
                this.manager.setComponent(entity, "drawable", {
                    type: "RECT",
                    width: Math.random() * 15,
                    height: Math.random() * 15,
                    color: stroked ? undefined : `#${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}`,
                    strokeColor: stroked ? `#${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}` : undefined,
                    strokeWidth: Math.random() * 3,
                } as DrawableData);
            }
        }
        log.info(`${n} created`);
    }
}

const start = () => {
    console.time("init");
    const game = new Game();
    console.timeEnd("init");
}

start();
