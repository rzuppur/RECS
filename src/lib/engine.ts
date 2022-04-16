import { LOG_LEVEL, Logger, LoggerFactory } from "./utils/logger";
import Manager from "./manager";
import WorldLocationComponent from "./components/worldLocation";
import ScreenLocationComponent from "./components/screenLocation";
import PointableComponent from "./components/pointable";
import DrawableComponent from "./components/drawable";
import PointerSystem from "./systems/input/pointer";
import KeyboardSystem from "./systems/input/keyboard";
import DisplaySystem from "./systems/display";

export default class Engine {
    private step: number = 0;
    private lastTickTime: number = -1;

    private readonly mountElQuery: string;
    private log: Logger;

    public manager: Manager;
    public running: boolean = true;

    constructor(mountElQuery = "body", debug: boolean = false) {
        LoggerFactory.setLevel(debug ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARNING);
        this.log = LoggerFactory.getLogger("Engine");
        this.log.new();

        this.mountElQuery = mountElQuery;

        this.manager = new Manager(debug);
        this.registerDefaultSystems();

        this.log.info("Entering main loop");
        window.requestAnimationFrame(this.tick.bind(this));
    }

    private registerDefaultSystems(): void {
        this.manager.registerComponent(new WorldLocationComponent());
        this.manager.registerComponent(new ScreenLocationComponent());
        this.manager.registerComponent(new PointableComponent());
        this.manager.registerComponent(new DrawableComponent());

        this.manager.registerSystem(new PointerSystem());
        this.manager.registerSystem(new KeyboardSystem());
        this.manager.registerSystem(new DisplaySystem(this.mountElQuery));
    }

    private tick(): void {
        if (this.running) {
            const now = performance.now();
            const dt = this.lastTickTime === -1 ? 0 : now - this.lastTickTime;

            this.step += 1;
            this.manager.tick(dt);

            window.requestAnimationFrame(this.tick.bind(this));
            this.lastTickTime = now;

        } else {
            this.log.warning("Main loop stopped");
            this.lastTickTime = -1;
        }
    }
}
