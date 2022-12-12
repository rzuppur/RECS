import { LoggerFactory, Logger } from "../../utils/logger";
import type Canvas from "./canvas";
import DrawableComponent from "../../components/drawable";
import ScreenLocationComponent from "../../components/screenLocation";
import Query from "../../query";

export default class DrawScreen {
    private canvas: Canvas;
    private log: Logger;

    constructor(canvas: Canvas) {
        this.log = LoggerFactory.getLogger("DrawScreen");
        this.log.new();
        this.canvas = canvas;
    }

    public tick(dt: number, query: Query): void {
        const sorted: Map<number, { sL: ScreenLocationComponent, d: DrawableComponent }[]> = new Map();
        query.getMatching().forEach((components, entity) => {
            const sL = Query.getComponent(components, ScreenLocationComponent);
            const d = Query.getComponent(components, DrawableComponent);
            const z = sL.data.z ?? 0;
            if (!sorted.has(z)) {
                sorted.set(z, [{ sL, d }]);
            } else {
                sorted.get(z).push({ sL, d });
            }
        });
        Array.from(sorted.keys()).sort((a, b) => a - b).forEach(z => {
            sorted.get(z).forEach(({ sL, d }) => {
                d.data.drawables.forEach((drawable) => {
                    let x = sL.data.loc.x;
                    let y = sL.data.loc.y;
                    if (drawable.offset) {
                        x += drawable.offset.x;
                        y += drawable.offset.y;
                    }
                    this.canvas.draw(x, y, drawable);
                });
            });
        });
    }
}
