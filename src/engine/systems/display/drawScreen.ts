import Logger from "../../utils/logger";
import System from "../index";
import Canvas from "./canvas";
import DrawableData from "../../components/drawableData";
import ScreenLocationData from "../../components/screenLocationData";

const log = new Logger("DrawScreenSystem");

export default class DrawScreenSystem extends System {
    private canvas: Canvas;
    constructor(canvas: Canvas) {
        super(["drawable", "screenLocation"]);
        log.new();

        this.canvas = canvas;
    }

    public tick(dt: number): void {
        this.query.getMatching().forEach((components, entity) => {
            const sL = components.get("screenLocation") as ScreenLocationData;
            const d = components.get("drawable") as DrawableData;
            this.canvas.draw(sL.x, sL.y, d);
        });
    }
}
