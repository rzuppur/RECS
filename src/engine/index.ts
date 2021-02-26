import Manager from "./manager.js";
import DisplaySystem from "./systems/display/index.js";
import PointerSystem from "./systems/input/pointer.js";
import Logger from "./utils/logger.js";

const log = new Logger("engine");

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
        this.manager.registerComponent("worldLocation");
        this.manager.registerComponent("screenLocation");
        this.manager.registerComponent("pointable");
        this.manager.registerComponent("drawable");

        const pointerSystem = new PointerSystem();
        this.manager.registerSystem("pointerInput", pointerSystem);

        const displaySystem = new DisplaySystem();
        this.manager.registerSystem("display", displaySystem);
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
