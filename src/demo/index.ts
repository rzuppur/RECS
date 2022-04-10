import { DisplaySystem, DrawableComponent, Engine, Entity, KeyboardSystem, Manager, PointableComponent, PointerSystem, Query, ScreenLocationComponent, System, Vector2, WorldLocationComponent } from "../engine";
import Logger from "../engine/utils/logger";

import { initializeFPS } from "./fpsSystem";
import { initializeAnimations } from "./animations";

const log = new Logger("Game");

class Game {
    private readonly engine: Engine;
    private readonly manager: Manager;

    constructor() {
        log.new();
        this.engine = new Engine("#game");
        this.manager = this.engine.manager;

        const gameSystem = new GameSystem();
        this.manager.registerSystem(gameSystem);

        initializeAnimations(this.manager);
        initializeFPS(this.manager);
    }
}

class GameSystem extends System {
    private displaySystem: DisplaySystem;
    private pointerSystem: PointerSystem;
    private keyboardSystem: KeyboardSystem;

    private coordinatesText: Entity;

    constructor() {
        super("Game", []);
    }

    start(query: Query, manager: Manager): boolean {
        this.displaySystem = manager.getSystem("Display") as DisplaySystem;
        this.pointerSystem = manager.getSystem("Pointer") as PointerSystem;
        this.keyboardSystem = manager.getSystem("Keyboard") as KeyboardSystem;

        this.coordinatesText = manager.createEntity();
        manager.setComponent(this.coordinatesText, new ScreenLocationComponent({
            loc: new Vector2(0, 0),
            z: 10,
        }));
        manager.setComponent(this.coordinatesText, new DrawableComponent({
            drawables: [
                { type: "TEXT", content: "", color: "#fff", size: 16, font: "monospace", offset: new Vector2(0, 30) },
            ]
        }));

        return super.start(query, manager);
    }

    tick(dt: number, manager: Manager) {
        this.displaySystem.view.radius *= 1 - (this.pointerSystem.wheelDeltaY * 0.004);
        // this.displaySystem.view.x += this.pointerSystem.wheelDeltaX / this.displaySystem.zoom;
        this.displaySystem.view.radius = Math.max(this.displaySystem.view.radius, 0.1);

        if (this.keyboardSystem.keysDown.has("ARROWDOWN")) this.displaySystem.view.y += 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWUP")) this.displaySystem.view.y -= 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWLEFT")) this.displaySystem.view.x -= 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWRIGHT")) this.displaySystem.view.x += 4 / this.displaySystem.zoom;

        const textComponents = manager.getEntityComponents(this.coordinatesText);

        const { data: coordinatesTextDrawable } = Query.getComponent(textComponents, DrawableComponent);
        coordinatesTextDrawable.drawables[0].content = `x: ${this.pointerSystem.pointerWorldX.toFixed(2)}\ny: ${this.pointerSystem.pointerWorldY.toFixed(2)}\nzoom: ${this.displaySystem.zoom.toFixed(3)}\n${Array.from(this.keyboardSystem.keysDown).join("+")}`;

        const { data: coordinatesTextLocation } = Query.getComponent(textComponents, ScreenLocationComponent);
        coordinatesTextLocation.loc = new Vector2(this.pointerSystem.pointerScreenX, this.pointerSystem.pointerScreenY);
    }
}

const start = () => {
    const game = new Game();
}

start();
