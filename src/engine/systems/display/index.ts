import System from "../index.js";
import {Query} from "../../manager.js";
import Canvas from "./canvas.js";
import WorldLocationData from "../../components/worldLocationData.js";
import DrawableData from "../../components/drawableData.js";
import Logger from "../../utils/logger.js";

const log = new Logger("displaySystem");

export default class DisplaySystem extends System {
    private canvas: Canvas;

    constructor() {
        super(["drawable", "worldLocation"]);
        log.new();
    }

    public initialize(query: Query): boolean {
        const bodyEl = document.querySelector("body");
        if (!bodyEl) return false;

        super.initialize(query);
        this.canvas = new Canvas().mount(bodyEl);
        return true;
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

    public getSize(): {width: number, height: number} {
        return this.canvas.getSize();
    }

    public disableSmoothing(): void {
        this.canvas.setSmoothing(false);
    }

    public enableSmoothing(): void {
        this.canvas.setSmoothing(true);
    }
}
