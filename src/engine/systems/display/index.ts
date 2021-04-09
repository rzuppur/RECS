import System from "../index";
import Manager, {Query} from "../../manager";
import Canvas from "./canvas";
import DrawWorldSystem from "./drawWorld";
import DrawScreenSystem from "./drawScreen";
import Logger from "../../utils/logger";

const log = new Logger("DisplaySystem");

export default class DisplaySystem extends System {
    private canvas: Canvas;
    private mountElQuery: string;

    constructor(mountElQuery: string) {
        log.new();
        super("Display", []);

        this.mountElQuery = mountElQuery;
    }

    public initialize(query: Query, manager: Manager): boolean {
        const mountEl = document.querySelector(this.mountElQuery) as HTMLElement;
        if (!mountEl) return false;

        super.initialize(query, manager);
        this.canvas = new Canvas().mount(mountEl);

        const drawWorldSystem = new DrawWorldSystem(this.canvas);
        manager.registerSystem(drawWorldSystem);

        const drawScreenSystem = new DrawScreenSystem(this.canvas);
        manager.registerSystem(drawScreenSystem);

        return true;
    }

    public getSize(): {width: number, height: number} {
        return this.canvas.getSize();
    }

    public getOffset(): {offsetX: number, offsetY: number} {
        return { offsetX: this.canvas.offsetX, offsetY: this.canvas.offsetY };
    }

    public disableSmoothing(): void {
        this.canvas.setSmoothing(false);
    }

    public enableSmoothing(): void {
        this.canvas.setSmoothing(true);
    }
}
