// utils
import Logger from "./utils/logger";
import Vector2 from "./utils/vector2";
import { clamp, InterpolatedValue } from "./utils/math";

// core
import Manager from "./manager";
import Query from "./query";
import System from "./systems/index";
import { Entity } from "./model";

// systems
import DisplaySystem from "./systems/display/index";
import PointerSystem from "./systems/input/pointer";
import KeyboardSystem from "./systems/input/keyboard";

// components
import Component, { ComponentData } from "./components/index";
import WorldLocationComponent from "./components/worldLocation";
import ScreenLocationComponent from "./components/screenLocation";
import PointableComponent from "./components/pointable";
import DrawableComponent, { Drawable } from "./components/drawable";

const log = new Logger("Engine");

export class Engine {
    private step: number = 0;
    private readonly boundTick = this.tick.bind(this);
    private lastTickTime: number = -1;

    private mountElQuery: string;

    public manager: Manager;
    public running: boolean = true;

    constructor(mountElQuery = "body", timeMainLoop: boolean = false) {
        log.new();

        this.mountElQuery = mountElQuery;

        this.manager = new Manager();
        this.registerDefaultSystems();

        if (timeMainLoop) {
            this.boundTick = this.timedTick.bind(this);
        }

        log.info("entering main loop");
        window.requestAnimationFrame(this.boundTick);
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
    Component,
    ComponentData,
    WorldLocationComponent,
    ScreenLocationComponent,
    PointableComponent,
    DrawableComponent,
    Drawable,
    DisplaySystem,
    PointerSystem,
    KeyboardSystem,
    Vector2,
    clamp,
    InterpolatedValue,
};
