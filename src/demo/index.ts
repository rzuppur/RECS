import { DisplaySystem, PointerSystem, DrawWorldSystem, DrawableComponent, PointableComponent, Engine, Manager, System, WorldLocationComponent, Query, ScreenLocationComponent, Entity } from "../engine";
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

        this.debugWorld();

        const fpsSystem = new FpsSystem();
        this.manager.registerSystem(fpsSystem);
        const gameSystem = new GameSystem();
        this.manager.registerSystem(gameSystem);
    }

    private debugWorld(): void {
        const n = 1000;
        const limX = 200;
        const limY = 100;

        log.info(`creating ${n}`);
        for (let i = 0; i < n; i++) {
            const entity = this.manager.createEntity();
            this.manager.setComponent(entity, new WorldLocationComponent({
                x: Math.random() * limX,
                y: Math.random() * limY,
            }));
            this.manager.setComponent(entity, new DrawableComponent({
                type: "RECT",
                width: 3,
                height: 3,
                color: "#555",
            }));
            this.manager.setComponent(entity, new PointableComponent({
                width: 3,
                height: 3,
            }));
        }

        log.info(`${n} created`);
    }
}

class GameSystem extends System {
    private displaySystem: DisplaySystem;
    private pointerSystem: PointerSystem;
    private drawWorldSystem: DrawWorldSystem;

    private coordinatesText: Entity;

    constructor() {
        super("Game", ["Pointable", "Drawable"]);
    }

    start(query: Query, manager: Manager): boolean {
        this.displaySystem = manager.getSystem("Display") as DisplaySystem;
        this.pointerSystem = manager.getSystem("Pointer") as PointerSystem;
        this.drawWorldSystem = manager.getSystem("DrawWorld") as DrawWorldSystem;

        this.coordinatesText = manager.createEntity();
        manager.setComponent(this.coordinatesText, new ScreenLocationComponent({
            x: 10,
            y: 100,
            z: 10,
        }));
        manager.setComponent(this.coordinatesText, new DrawableComponent({
            type: "TEXT",
            content: "",
            color: "#fff",
            size: 16,
            font: "monospace",
        }));

        return super.start(query, manager);
    }

    tick(dt: number, manager: Manager) {
        this.drawWorldSystem.view.x += this.pointerSystem.wheelDeltaX * 0.2;
        this.drawWorldSystem.view.y += this.pointerSystem.wheelDeltaY * 0.2;

        const coordinatesTextDrawable = manager.getEntityComponents(this.coordinatesText).get("Drawable") as DrawableComponent;
        coordinatesTextDrawable.data.content = `x: ${this.pointerSystem.pointerWorldX.toFixed(2)}\ny: ${this.pointerSystem.pointerWorldY.toFixed(2)}`;
        const coordinatesTextLocation = manager.getEntityComponents(this.coordinatesText).get("ScreenLocation") as ScreenLocationComponent;
        coordinatesTextLocation.data.x = this.pointerSystem.pointerScreenX;
        coordinatesTextLocation.data.y = this.pointerSystem.pointerScreenY + 30;

        this.query.getMatching().forEach((components, entity) => {
            const p = components.get("Pointable") as PointableComponent;
            const d = components.get("Drawable") as DrawableComponent;
            d.data.alpha = p.data.hovered ? 1 : 0.4;
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
