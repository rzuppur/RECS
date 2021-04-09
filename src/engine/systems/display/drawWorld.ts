import Logger from "../../utils/logger";
import System from "../index";
import Canvas from "./canvas";
import WorldLocationData from "../../components/worldLocationData";
import DrawableData from "../../components/drawableData";

const log = new Logger("DrawWorldSystem");

export default class DrawWorldSystem extends System {
    private canvas: Canvas;
    constructor(canvas: Canvas) {
        super("DrawWorld", ["drawable", "worldLocation"]);
        log.new();

        this.canvas = canvas;
    }

    public tick(dt: number): void {
        this.canvas.clear();

        this.query.getMatching().forEach((components, entity) => {
            const wL = components.get("worldLocation") as WorldLocationData;
            const d = components.get("drawable") as DrawableData;
            this.canvas.draw(wL.x, wL.y, d);
        });
    }
}
