import Logger from "../../utils/logger";
import System from "../index";
import Canvas from "./canvas";
import DrawableComponent from "../../components/drawable";
import ScreenLocationComponent from "../../components/screenLocation";
import Query from "../../query";

const log = new Logger("DrawScreenSystem");

export default class DrawScreenSystem extends System {
    private canvas: Canvas;

    constructor(canvas: Canvas) {
        super("DrawScreen", [DrawableComponent.key, ScreenLocationComponent.key]);
        log.new();

        this.canvas = canvas;
    }

    public tick(dt: number): void {
        const sorted: Map<number, { sL: ScreenLocationComponent, d: DrawableComponent }[]> = new Map();
        this.query.getMatching().forEach((components, entity) => {
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
