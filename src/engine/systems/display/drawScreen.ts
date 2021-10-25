import Logger from "../../utils/logger";
import Canvas from "./canvas";
import DrawableComponent from "../../components/drawable";
import ScreenLocationComponent from "../../components/screenLocation";
import Query from "../../query";

const log = new Logger("DrawScreen");

export default class DrawScreen {
    private canvas: Canvas;

    constructor(canvas: Canvas) {
        log.new();
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
        Array.from(sorted.keys()).sort().forEach(z => {
            sorted.get(z).forEach(({ sL, d }) => this.canvas.draw(sL.data.x, sL.data.y, d.data));
        });
    }
}
