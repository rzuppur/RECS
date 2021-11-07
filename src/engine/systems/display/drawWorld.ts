import Logger from "../../utils/logger";
import Canvas from "./canvas";
import WorldLocationComponent from "../../components/worldLocation";
import DrawableComponent from "../../components/drawable";
import Query from "../../query";

const log = new Logger("DrawWorld");

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

    public view: WorldView = { x: 100, y: 50, radius: 80 };

    constructor(canvas: Canvas) {
        log.new();
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
                this.canvas.draw(wL.data.loc.x + this._offsetX, wL.data.loc.y + this._offsetY, d.data, this._zoom);
            });
        });
    }
}
