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

        this.query.getMatching().forEach((components, entity) => {
            const wL = components.get("WorldLocation") as WorldLocationComponent;
            const d = components.get("Drawable") as DrawableComponent;
            this.canvas.draw(wL.data.x, wL.data.y, d.data);
        });
    }
}
