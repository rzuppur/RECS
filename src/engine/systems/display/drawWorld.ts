import Logger from "../../utils/logger";
import System from "../index";
import Canvas from "./canvas";
import WorldLocationData from "../../components/worldLocationData";
import DrawableData from "../../components/drawableData";

const log = new Logger("DrawWorldSystem");

export default class DrawWorldSystem extends System {
    private canvas: Canvas;
    constructor(canvas: Canvas) {
        super(["drawable", "worldLocation"]);
        log.new();

        this.canvas = canvas;
    }

    public tick(dt: number): void {
        this.canvas.clear();

        this.query.getMatching().forEach((components, entity) => {
            const wL = components.get("worldLocation") as WorldLocationData;
            const d = components.get("drawable") as DrawableData;
            if (d.type === "RECT") {
                if (d.strokeColor) {
                    this.canvas.drawRectStroke(wL.x, wL.y, d.width, d.height, d.strokeColor, d.strokeWidth ?? 1);
                } else {
                    this.canvas.drawRect(wL.x, wL.y, d.width, d.height, d.color);
                }
            } else if (d.type === "TEXT") {
                this.canvas.drawText(wL.x, wL.y, d.content, d.size ?? 16, d.color ?? "#fff");
            } else if (d.type === "SPRITE") {
                this.canvas.drawSprite(wL.x + (d.offsetX ?? 0), wL.y + (d.offsetY ?? 0), d.width, d.height, d.imageSrc);
            }
        });
    }
}
