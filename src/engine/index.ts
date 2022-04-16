// utils
import { LoggerFactory, Logger, LOG_LEVEL } from "./utils/logger";
import Vector2 from "./utils/vector2";
import { clamp, InterpolatedValue } from "./utils/math";
export { Vector2, clamp, InterpolatedValue };

// core
import Manager from "./manager";
import Query from "./query";
import System from "./systems/index";
import { Entity } from "./model";
import Component, { ComponentData } from "./components/index";
export { Manager, Query, System, Entity, Component, ComponentData };

// systems
import DisplaySystem from "./systems/display/index";
import PointerSystem from "./systems/input/pointer";
import KeyboardSystem from "./systems/input/keyboard";
export { DisplaySystem, PointerSystem, KeyboardSystem };

// components
import WorldLocationComponent from "./components/worldLocation";
import ScreenLocationComponent from "./components/screenLocation";
import PointableComponent from "./components/pointable";
import DrawableComponent, { Drawable } from "./components/drawable";
export { WorldLocationComponent, ScreenLocationComponent, PointableComponent, DrawableComponent, Drawable };

export class Engine {
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

        this.log.info("entering main loop");
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
            this.log.warning("main loop stopped");
            this.lastTickTime = -1;
        }
    }
}
