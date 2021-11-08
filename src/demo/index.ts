import { DisplaySystem, DrawableComponent, Engine, Entity, KeyboardSystem, Manager, PointableComponent, PointerSystem, Query, ScreenLocationComponent, System, Vector2, WorldLocationComponent } from "../engine";
import Logger from "../engine/utils/logger";

import { initializeFPS } from "./fpsSystem";

const log = new Logger("Game");

class Game {
    private readonly engine: Engine;
    private readonly manager: Manager;

    constructor() {
        log.new();
        this.engine = new Engine("#game");
        this.manager = this.engine.manager;

        this.debugWorld();

        const gameSystem = new GameSystem();
        this.manager.registerSystem(gameSystem);

        initializeFPS(this.manager);
    }

    private debugWorld(): void {
        const n = 1000;
        const limX = 200;
        const limY = 100;

        log.info(`creating ${n}`);
        for (let i = 0; i < n; i++) {
            const entity = this.manager.createEntity();
            this.manager.setComponent(entity, new WorldLocationComponent({ loc: new Vector2(Math.random() * limX, Math.random() * limY) }));
            this.manager.setComponent(entity, new DrawableComponent({
                drawables: [
                    { type: "RECT", width: 3, height: 3, color: "#555" },
                ]
            }));
            this.manager.setComponent(entity, new PointableComponent({
                width: 3,
                height: 3,
            }));
        }

        const sprite = this.manager.createEntity();
        let path = [];
        const pN = 10_000;
        for (let i = 0; i < pN; i++) {
            path.push([Math.cos(i * 2 * Math.PI / pN) * 100, Math.sin(i * 2 * Math.PI / pN) * 100]);
        }
        this.manager.setComponent(sprite, new WorldLocationComponent({ loc: new Vector2(0, 0) }));
        this.manager.setComponent(sprite, new DrawableComponent({
            drawables: [
                {
                    type: "SPRITE",
                    imageSrc: "https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png",
                    width: 30,
                    height: 30,
                    offset: new Vector2(85, 35)
                },
                {
                    type: "SPRITE_FIXED_SIZE",
                    imageSrc: "https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png",
                    width: 50,
                    height: 50,
                },
                { type: "PATH", strokeColor: "#fff", strokeWidth: 2, path, offset: new Vector2(100, 50) },
            ],
        }));
        log.info(`${n} created`);
    }
}

class GameSystem extends System {
    private displaySystem: DisplaySystem;
    private pointerSystem: PointerSystem;
    private keyboardSystem: KeyboardSystem;

    private coordinatesText: Entity;

    constructor() {
        super("Game", [PointableComponent.key, DrawableComponent.key]);
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
        this.displaySystem.view.radius *= 1 - (this.pointerSystem.wheelDeltaY * 0.005);
        //this.displaySystem.view.x += this.pointerSystem.wheelDeltaX / this.displaySystem.zoom;
        this.displaySystem.view.radius = Math.max(this.displaySystem.view.radius, 0.1);

        if (this.keyboardSystem.keysDown.has("ARROWDOWN")) this.displaySystem.view.y += 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWUP")) this.displaySystem.view.y -= 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWLEFT")) this.displaySystem.view.x -= 4 / this.displaySystem.zoom;
        if (this.keyboardSystem.keysDown.has("ARROWRIGHT")) this.displaySystem.view.x += 4 / this.displaySystem.zoom;

        const coordinatesTextDrawable = Query.getComponent(manager.getEntityComponents(this.coordinatesText), DrawableComponent);
        coordinatesTextDrawable.data.drawables[0].content = `x: ${this.pointerSystem.pointerWorldX.toFixed(2)}\ny: ${this.pointerSystem.pointerWorldY.toFixed(2)}\nzoom: ${this.displaySystem.zoom.toFixed(3)}\n${Array.from(this.keyboardSystem.keysDown).join("+")}`;
        const coordinatesTextLocation = Query.getComponent(manager.getEntityComponents(this.coordinatesText), ScreenLocationComponent);
        coordinatesTextLocation.data.loc = new Vector2(this.pointerSystem.pointerScreenX, this.pointerSystem.pointerScreenY);

        this.query.getMatching().forEach((components, entity) => {
            const p = Query.getComponent(components, PointableComponent);
            const d = Query.getComponent(components, DrawableComponent);
            d.data.drawables[0].alpha = p.data.hovered ? 0.7 : 1;
            if (p.data.clicked) {
                d.data.drawables[0].color = `#${Math.ceil(Math.random() * 9)}${Math.ceil(Math.random() * 9)}${Math.ceil(Math.random() * 9)}`;
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
