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

    /**
     * @param mountElQuery - A new canvas element will be added as a child here.
     *
     * Canvas fills the entire parent and uses ResizeObserver to adjust on resize.
     */
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

    /**
     * Returns canvas size in CSS pixels.This is not the actual screen pixels size, unless screen has a 1x pixel ratio.
     */
    public getSize(): {width: number, height: number} {
        return this.canvas.getSize();
    }

    /**
     * Canvas offset on page.
     * Used for correct pointer input calculations if canvas does not start from (0,0).
     */
    public getOffset(): {offsetX: number, offsetY: number} {
        return this.canvas.getOffset();
    }

    public disableSmoothing(): void {
        this.canvas.setSmoothing(false);
    }

    public enableSmoothing(): void {
        this.canvas.setSmoothing(true);
    }

    /**
     * Supports only one callback, will use the latest.
     * Called every time canvas size changes, including initialization.
     * Useful for positioning GUI, etc
     */
    public onCanvasSizeChange(callback: (width: number, height: number) => void): void {
        this.canvas.onSizeChange = callback;
    }
}
