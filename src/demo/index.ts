import { clamp, DisplaySystem, DrawableComponent, Engine, KeyboardSystem, Manager, PointerSystem, Query, ScreenLocationComponent, System, Vector2 } from "../lib";
import type { Entity } from "../lib";

import { initializeAnimations } from "./animations";

class Game {
    private readonly engine: Engine;
    private readonly manager: Manager;

    constructor() {
        this.engine = new Engine("#game", true);
        this.manager = this.engine.manager;

        const gameSystem = new GameSystem();
        this.manager.registerSystem(gameSystem);

        initializeAnimations(this.manager);
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
            loc: Vector2.new(),
            z: 10,
        }));
        manager.setComponent(this.coordinatesText, new DrawableComponent({
            drawables: [
                { type: "TEXT", content: "", color: "#fff", size: 16, font: "monospace", offset: Vector2.new(0, 30) },
            ]
        }));

        return super.start(query, manager);
    }

    tick(dt: number, manager: Manager) {
        this.displaySystem.view.radius *= 1 - (this.pointerSystem.wheelDeltaY * 0.002);
        this.displaySystem.view.radius = clamp(0.1, this.displaySystem.view.radius, 1000);

        if (this.keyboardSystem.keysDown.has("ARROWDOWN")) this.displaySystem.view.y += 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWUP")) this.displaySystem.view.y -= 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWLEFT")) this.displaySystem.view.x -= 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWRIGHT")) this.displaySystem.view.x += 4 / this.displaySystem.zoom;

        const textComponents = manager.getEntityComponents(this.coordinatesText);

        const { data: coordinatesTextDrawable } = Query.getComponent(textComponents, DrawableComponent);
        coordinatesTextDrawable.drawables[0].content = `x: ${this.pointerSystem.pointerWorldX.toFixed(2)}\ny: ${this.pointerSystem.pointerWorldY.toFixed(2)}\nzoom: ${this.displaySystem.zoom.toFixed(3)}\n${Array.from(this.keyboardSystem.keysDown).join("+")}`;

        const { data: coordinatesTextLocation } = Query.getComponent(textComponents, ScreenLocationComponent);
        coordinatesTextLocation.loc.free();
        coordinatesTextLocation.loc = Vector2.new(this.pointerSystem.pointerScreenX, this.pointerSystem.pointerScreenY);
    }
}

const start = () => {
    const game = new Game();
}

start();
