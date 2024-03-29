import System from "../index";
import type Manager from "../../manager";
import type Query from "../../query";
import { LoggerFactory, Logger } from "../../utils/logger";

export default class KeyboardSystem extends System {
    public keysDown: Set<string> = new Set();
    public keysReleased: Set<string> = new Set();

    private keysReleasedToDelete: Set<string> = new Set();
    private PREVENT_KEYS = ["Tab", "Alt", "Control"];

    private log: Logger;

    constructor() {
        super("Keyboard", []);
        this.log = LoggerFactory.getLogger("KeyboardSystem");
        this.log.new();
    }

    private static replaceKeyNames(keyName: string): string {
        if (keyName === " ") return "SPACE";
        return keyName.toUpperCase();
    }

    private keyDownHandler(event: KeyboardEvent): void {
        this.keysDown.add(KeyboardSystem.replaceKeyNames(event.key));
        if (this.PREVENT_KEYS.includes(event.key)) event.preventDefault();
    }

    private keyUpHandler(event: KeyboardEvent): void {
        this.keysDown.delete(KeyboardSystem.replaceKeyNames(event.key));
        this.keysReleased.add(KeyboardSystem.replaceKeyNames(event.key));
    }

    private blurHandler(): void {
        this.keysDown.forEach(key => this.keysReleased.add(key));
        this.keysDown = new Set();
    }

    public start(query: Query, manager: Manager): boolean {
        window.addEventListener("keydown", this.keyDownHandler.bind(this));
        window.addEventListener("keyup", this.keyUpHandler.bind(this));
        window.addEventListener("blur", this.blurHandler.bind(this));

        return super.start(query, manager);
    }

    public tick(dt: number): void {
        this.keysReleasedToDelete.forEach(key => {
            this.keysReleased.delete(key);
            this.keysReleasedToDelete.delete(key);
        });

        this.keysReleased.forEach(key => this.keysReleasedToDelete.add(key));
    }
}
