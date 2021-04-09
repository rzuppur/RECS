import Logger from "../../utils/logger";
import System from "../index";
import Canvas from "./canvas";
import WorldLocationComponent from "../../components/worldLocation";
import DrawableComponent from "../../components/drawable";

const log = new Logger("DrawWorldSystem");

export default class DrawWorldSystem extends System {
    private canvas: Canvas;
    constructor(canvas: Canvas) {
        super("DrawWorld", ["Drawable", "WorldLocation"]);
        log.new();

        this.canvas = canvas;
    }

    public tick(dt: number): void {
        this.canvas.clear();

        // TODO: convert to screen coordinates, filter out of view

        const sorted: Map<number, {wL: WorldLocationComponent, d: DrawableComponent}[]> = new Map();
        this.query.getMatching().forEach((components, entity) => {
            const wL = components.get("WorldLocation") as WorldLocationComponent;
            const d = components.get("Drawable") as DrawableComponent;
            const z = wL.data.z ?? 0;
            if (!sorted.has(z)) {
                sorted.set(z, [{wL, d}]);
            } else {
                sorted.get(z).push({wL, d});
            }
        });
        Array.from(sorted.keys()).sort().forEach(z => {
            sorted.get(z).forEach(({wL, d}) => this.canvas.draw(wL.data.x, wL.data.y, d.data));
        });
    }
}
