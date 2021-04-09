import Logger from "./utils/logger";
import Manager, { Query, Entity } from "./manager";
import System from "./systems/index";
import DisplaySystem from "./systems/display/index";
import PointerSystem from "./systems/input/pointer";
import ComponentData from "./components/index";
import DrawableData from "./components/drawableData";
import PointableData from "./components/pointableData";
import ScreenLocationData from "./components/screenLocationData";
import WorldLocationData from "./components/worldLocationData";

const log = new Logger("Engine");

export class Engine {
    private step: number = 0;
    private readonly boundTick = this.tick.bind(this);
    private lastTickTime: number = -1;

    public manager: Manager;
    public running: boolean = true;

    constructor(timeMainLoop: boolean = false) {
        log.new();

        this.manager = new Manager();
        this.registerDefaultSystems();

        if (timeMainLoop) {
            this.boundTick = this.timedTick.bind(this);
        }

        log.info("entering main loop");
        window.requestAnimationFrame(this.boundTick);
    }

    private registerDefaultSystems(): void {
        this.manager.registerComponent("screenLocation");
        this.manager.registerComponent("worldLocation");
        this.manager.registerComponent("pointable");
        this.manager.registerComponent("drawable");

        const pointerSystem = new PointerSystem();
        this.manager.registerSystem(pointerSystem);

        const displaySystem = new DisplaySystem();
        this.manager.registerSystem(displaySystem);
    }

    private tick(): void {
        if (this.running) {
            const now = performance.now();
            const dt = this.lastTickTime === -1 ? 0 : now - this.lastTickTime;

            this.step += 1;
            this.manager.tick(dt);

            window.requestAnimationFrame(this.boundTick);
            this.lastTickTime = now;

        } else {
            log.warning("main loop stopped");
            this.lastTickTime = -1;
        }
    }

    private timedTick(): void {
        console.time("engineTick");
        this.tick();
        console.timeEnd("engineTick");
    }
}

export {
    Manager,
    System,
    Query,
    Entity,
    ComponentData,
    PointableData,
    ScreenLocationData,
    WorldLocationData,
    DrawableData,
    DisplaySystem,
};
