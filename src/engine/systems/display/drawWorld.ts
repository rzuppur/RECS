import { LoggerFactory, Logger } from "../../utils/logger";
import Canvas from "./canvas";
import WorldLocationComponent from "../../components/worldLocation";
import DrawableComponent from "../../components/drawable";
import Query from "../../query";

export interface WorldView {
    x: number;
    y: number;
    radius: number;
}

export default class DrawWorld {
    private canvas: Canvas;
    private _zoom: number = 1;
    private _offsetX: number = 0;
    private _offsetY: number = 0;

    private log: Logger;

    public view: WorldView = { x: 0, y: 0, radius: 100 };

    constructor(canvas: Canvas) {
        this.log = LoggerFactory.getLogger("DrawWorld");
        this.log.new();
        this.canvas = canvas;
    }

    public get zoom(): number {
        return this._zoom;
    }

    public get offsetX(): number {
        return this._offsetX;
    }

    public get offsetY(): number {
        return this._offsetY;
    }

    public tick(dt: number, query: Query): void {
        this.canvas.clear();

        const { width: canvasWidth, height: canvasHeight } = this.canvas.getSize();
        this._zoom = Math.min(canvasWidth, canvasHeight) / (this.view.radius * 2);
        const midX = canvasWidth * 0.5;
        const midY = canvasHeight * 0.5;
        this._offsetX = midX / this._zoom - this.view.x;
        this._offsetY = midY / this._zoom - this.view.y;

        // TODO: filter out of view

        const sorted: Map<number, { wL: WorldLocationComponent, d: DrawableComponent }[]> = new Map();
        query.getMatching().forEach((components, entity) => {
            const wL = Query.getComponent(components, WorldLocationComponent);
            const d = Query.getComponent(components, DrawableComponent);
            const z = wL.data.z ?? 0;
            if (!sorted.has(z)) {
                sorted.set(z, [{ wL, d }]);
            } else {
                sorted.get(z).push({ wL, d });
            }
        });
        Array.from(sorted.keys()).sort().forEach(z => {
            sorted.get(z).forEach(({ wL, d }) => {
                d.data.drawables.forEach((drawable) => {
                    let x = wL.data.loc.x;
                    let y = wL.data.loc.y;
                    if (drawable.offset) {
                        if (drawable.type.endsWith("_FIXED_SIZE")) {
                            x += drawable.offset.x / this._zoom;
                            y += drawable.offset.y / this._zoom;
                        } else {
                            x += drawable.offset.x;
                            y += drawable.offset.y;
                        }
                    }
                    this.canvas.draw(x + this._offsetX, y + this._offsetY, drawable, this._zoom);
                });
            });
        });
    }
}
