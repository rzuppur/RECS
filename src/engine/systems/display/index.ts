import System from "../index";
import Manager, {Query} from "../../manager";
import Canvas from "./canvas";
import DrawWorldSystem from "./drawWorld";
import Logger from "../../utils/logger";
import DrawScreenSystem from "./drawScreen";

const log = new Logger("DisplaySystem");

export default class DisplaySystem extends System {
    private canvas: Canvas;

    constructor() {
        super("Display", []);
        log.new();
    }

    public initialize(query: Query, manager: Manager): boolean {
        const bodyEl = document.querySelector("body");
        if (!bodyEl) return false;

        super.initialize(query, manager);
        this.canvas = new Canvas().mount(bodyEl);

        const drawWorldSystem = new DrawWorldSystem(this.canvas);
        manager.registerSystem(drawWorldSystem);

        const drawScreenSystem = new DrawScreenSystem(this.canvas);
        manager.registerSystem(drawScreenSystem);

        return true;
    }

    public getSize(): {width: number, height: number} {
        return this.canvas.getSize();
    }

    public disableSmoothing(): void {
        this.canvas.setSmoothing(false);
    }

    public enableSmoothing(): void {
        this.canvas.setSmoothing(true);
    }
}
