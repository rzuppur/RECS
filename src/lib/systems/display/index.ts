import System from "../index";
import type Manager from "../../manager";
import Canvas from "./canvas";
import type { CanvasTextMetrics } from "./canvas";
import { LoggerFactory, Logger } from "../../utils/logger";
import DrawWorld from "./drawWorld";
import type { WorldView } from "./drawWorld";
import DrawScreen from "./drawScreen";
import DrawableComponent from "../../components/drawable";
import ScreenLocationComponent from "../../components/screenLocation";
import WorldLocationComponent from "../../components/worldLocation";
import Query from "../../query";
import Vector2 from "../../utils/vector2";

export default class DisplaySystem extends System {
    private drawWorld: DrawWorld;
    private drawScreen: DrawScreen;
    private canvas: Canvas;
    private readonly mountElQuery: string;
    private worldQuery: Query;
    private screenQuery: Query;
    private log: Logger;

    /**
     * @param mountElQuery - A new canvas element will be added as a child here.
     *
     * Canvas fills the entire parent and uses ResizeObserver to adjust on resize.
     */
    constructor(mountElQuery: string) {
        super("Display", []);

        this.log = LoggerFactory.getLogger("DisplaySystem");
        this.log.new();
        this.mountElQuery = mountElQuery;
    }

    public get zoom(): number {
        return this.drawWorld.zoom;
    }

    public get offsetX(): number {
        return this.drawWorld.offsetX;
    }

    public get offsetY(): number {
        return this.drawWorld.offsetY;
    }

    public get view(): WorldView {
        return this.drawWorld.view;
    }

    public set view(value: WorldView) {
        this.drawWorld.view = value;
    }

    public beforeStart(manager: Manager): boolean {
        const mountEl = document.querySelector(this.mountElQuery) as HTMLElement;
        if (!mountEl) return false;

        this.canvas = new Canvas();
        this.canvas.mount(mountEl);
        this.drawWorld = new DrawWorld(this.canvas);
        this.drawScreen = new DrawScreen(this.canvas);

        this.worldQuery = manager.registerQuery(Query.getComponentsQuery([DrawableComponent.key, WorldLocationComponent.key]));
        this.screenQuery = manager.registerQuery(Query.getComponentsQuery([DrawableComponent.key, ScreenLocationComponent.key]));

        return true;
    }

    /**
     * Returns canvas size in CSS pixels.This is not the actual screen pixels size, unless screen has a 1x pixel ratio.
     */
    public getSize(): { width: number, height: number } {
        return this.canvas.getSize();
    }

    /**
     * Canvas offset on page.
     * Used for correct pointer input calculations if canvas does not start from (0,0).
     */
    public getOffset(): Vector2 {
        return this.canvas.getOffset();
    }

    public setSmoothing(value: boolean): void {
        this.canvas.setSmoothing(value);
    }

    public worldLocationToScreen(worldLocation: Vector2): Vector2 {
        return worldLocation.add(Vector2.new(this.offsetX, this.offsetY).release()).release().multiply(this.zoom);
    }

    public screenLocationToWorld(screenLocation: Vector2): Vector2 {
        return screenLocation.divide(this.zoom).release().subtract(Vector2.new(this.offsetX, this.offsetY).release());
    }

    public measureText(text: string, size: number = 16, font: string = "sans-serif", fontWeight: number = 400): CanvasTextMetrics {
        return this.canvas.measureText(text, size, font, fontWeight);
    }

    /**
     * Supports only one callback, will use the latest.
     * Called every time canvas size changes, including initialization.
     * Useful for positioning GUI, etc
     */
    public onCanvasSizeChange(callback: (width: number, height: number) => void): void {
        this.canvas.onSizeChange = callback;
    }

    public tick(dt: number, manager: Manager) {
        this.drawWorld.tick(dt, this.worldQuery);
        this.drawScreen.tick(dt, this.screenQuery);
    }
}
