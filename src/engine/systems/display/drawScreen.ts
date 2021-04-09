import Logger from "../../utils/logger";
import System from "../index";
import Canvas from "./canvas";
import DrawableComponent from "../../components/drawable";
import ScreenLocationComponent from "../../components/screenLocation";

const log = new Logger("DrawScreenSystem");

export default class DrawScreenSystem extends System {
    private canvas: Canvas;
    constructor(canvas: Canvas) {
        super("DrawScreen", ["Drawable", "ScreenLocation"]);
        log.new();

        this.canvas = canvas;
    }

    public tick(dt: number): void {
        const sorted: Map<number, {sL: ScreenLocationComponent, d: DrawableComponent}[]> = new Map();
        this.query.getMatching().forEach((components, entity) => {
            const sL = components.get("ScreenLocation") as ScreenLocationComponent;
            const d = components.get("Drawable") as DrawableComponent;
            const z = sL.data.z ?? 0;
            if (!sorted.has(z)) {
                sorted.set(z, [{sL, d}]);
            } else {
                sorted.get(z).push({sL, d});
            }
        });
        Array.from(sorted.keys()).sort().forEach(z => {
            sorted.get(z).forEach(({sL, d}) => this.canvas.draw(sL.data.x, sL.data.y, d.data));
        });
    }
}
