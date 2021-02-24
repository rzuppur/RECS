import System from "../index.js";
import { Query } from "../../manager";
import PointableData from "../../components/pointableData.js";
import Logger from "../../utils/logger.js";
import { pointInBox } from "../../utils/boundingBox.js";
import WorldLocationData from "../../components/worldLocationData";

const log = new Logger("pointerInputSystem");

export default class PointerSystem extends System {
    private pointerLastX: number = 0;
    private pointerLastY: number = 0;

    private pointerDeltaX: number = 0;
    private pointerDeltaY: number = 0;

    private pointerX: number = 0;
    private pointerY: number = 0;

    private pointerDownStartX: number = 0;
    private pointerDownStartY: number = 0;

    private pointerDown: boolean = false;
    private pointerDragging: boolean = false;
    private pointerClicked: boolean = false;
    private pointerActive: boolean = false;

    public DRAG_START_THRESHOLD_PX: number = 6;

    constructor() {
        super(["pointable"]);
        log.new();
    }

    private onPointerDown(x: number, y: number) {
        this.pointerDown = true;

        this.pointerX = this.pointerLastX = this.pointerDownStartX = x;
        this.pointerY = this.pointerLastY = this.pointerDownStartY = y;
    }

    private onPointerMove(x: number, y: number) {
        this.pointerX = x;
        this.pointerY = y;

        if (this.pointerDown) {
            if (Math.abs(this.pointerDownStartX - this.pointerX) > this.DRAG_START_THRESHOLD_PX
             || Math.abs(this.pointerDownStartY - this.pointerY) > this.DRAG_START_THRESHOLD_PX) {
                this.pointerDragging = true;
            }
        }

        if (this.pointerDragging) {
            this.calculateDelta();
        }
    }

    private onPointerUp() {
        if (this.pointerDown && !this.pointerDragging) this.pointerClicked = true;
        this.pointerDown = false;
        this.pointerDragging = false;
        this.resetDelta();
    }

    private mouseDownHandler(event: MouseEvent): void {
        this.pointerActive = true;

        if (event.button === 0) this.onPointerDown(event.clientX, event.clientY);
    }

    private mouseMoveHandler(event: MouseEvent): void {
        this.pointerActive = true;

        if (event.button === 0) this.onPointerMove(event.clientX, event.clientY);
    }

    private mouseUpHandler(event: MouseEvent): void {
        if (event.button === 0) this.onPointerUp();
    }

    private mouseOutHandler(event: MouseEvent): void {
        if (this.pointerDragging) return;
        this.pointerActive = false;
    }

    private touchStartHandler(event: TouchEvent): void {
        this.pointerActive = true;

        event.preventDefault();
        this.onPointerDown(event.touches[0].clientX, event.touches[0].clientY);
    }

    private touchMoveHandler(event: TouchEvent): void {
        this.pointerActive = true;

        event.preventDefault();
        this.onPointerMove(event.touches[0].clientX, event.touches[0].clientY);
    }

    private touchEndHandler(event: TouchEvent): void {
        event.preventDefault();
        this.onPointerUp();
    }

    private calculateDelta() {
        this.pointerDeltaX = this.pointerLastX - this.pointerX;
        this.pointerDeltaY = this.pointerLastY - this.pointerY;

        this.pointerLastX = this.pointerX;
        this.pointerLastY = this.pointerY;
    }

    private resetDelta() {
        this.pointerDeltaX = 0;
        this.pointerDeltaY = 0;
    }

    public initialize(query: Query): boolean {
        document.addEventListener("mousedown", this.mouseDownHandler.bind(this), false);
        document.addEventListener("mousemove", this.mouseMoveHandler.bind(this), false);
        document.addEventListener("mouseup", this.mouseUpHandler.bind(this), false);
        document.addEventListener("mouseout", this.mouseOutHandler.bind(this), false);

        document.addEventListener("touchstart", this.touchStartHandler.bind(this), false);
        document.addEventListener("touchmove", this.touchMoveHandler.bind(this), false);
        document.addEventListener("touchend", this.touchEndHandler.bind(this), false);
        document.addEventListener("touchcancel", this.touchEndHandler.bind(this), false);

        super.initialize(query);

        return true;
    }

    public tick(dt: number): void {
        if (this.pointerDragging) this.resetDelta();

        this.query.getMatching().forEach(entityMatch => {
            const pointableComponent = entityMatch.get("pointable") as PointableData;
            if (!this.pointerActive) {
                pointableComponent.clicked = false;
                pointableComponent.hovered = false;
                return;
            }

            const wL = entityMatch.get("worldLocation") as WorldLocationData;
            if (wL) {
                pointableComponent.hovered = pointInBox(this.pointerX, this.pointerY, wL.x, wL.y, pointableComponent.width, pointableComponent.height);
                if (this.pointerClicked) {
                    pointableComponent.clicked = pointInBox(this.pointerDownStartX, this.pointerDownStartY, wL.x, wL.y, pointableComponent.width, pointableComponent.height)
                } else {
                    pointableComponent.clicked = false;
                }
            }
        });

        this.pointerClicked = false;
    }
}
