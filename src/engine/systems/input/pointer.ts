import System from "../index";
import Manager, { Query } from "../../manager";
import Logger from "../../utils/logger";
import { pointInBox } from "../../utils/boundingBox";
import PointableComponent, { PointableData } from "../../components/pointable";
import WorldLocationComponent from "../../components/worldLocation";
import ScreenLocationComponent from "../../components/screenLocation";
import DisplaySystem from "../display/index";

const log = new Logger("PointerInputSystem");

export default class PointerSystem extends System {
    private manager: Manager;

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
        super("Pointer", ["Pointable"]);
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

    public initialize(query: Query, manager: Manager): boolean {
        this.manager = manager;

        document.addEventListener("mousedown", this.mouseDownHandler.bind(this), false);
        document.addEventListener("mousemove", this.mouseMoveHandler.bind(this), false);
        document.addEventListener("mouseup", this.mouseUpHandler.bind(this), false);
        document.addEventListener("mouseout", this.mouseOutHandler.bind(this), false);

        document.addEventListener("touchstart", this.touchStartHandler.bind(this), false);
        document.addEventListener("touchmove", this.touchMoveHandler.bind(this), false);
        document.addEventListener("touchend", this.touchEndHandler.bind(this), false);
        document.addEventListener("touchcancel", this.touchEndHandler.bind(this), false);

        super.initialize(query, manager);

        return true;
    }

    public tick(dt: number): void {
        if (this.pointerDragging) this.resetDelta();

        const ds = this.manager.getSystem("Display") as DisplaySystem;
        const {offsetX, offsetY} = ds.getOffset();
        const pointerX = this.pointerX - offsetX;
        const pointerY = this.pointerY - offsetY;

        const eventTargets: { z: number; pD: PointableData; }[] = [];

        this.query.getMatching().forEach((components, entity) => {
            const p = components.get("Pointable") as PointableComponent;
            if (!this.pointerActive) {
                p.data.clicked = false;
                p.data.hovered = false;
                return;
            }

            let screenW, screenH, screenX, screenY, screenZ;

            const wL = components.get("WorldLocation") as WorldLocationComponent;
            if (wL) {
                // TODO: transform from world coordinates to screen
                screenW = p.data.width;
                screenH = p.data.height;
                screenX = wL.data.x;
                screenY = wL.data.y;
                screenZ = wL.data.z ?? 0;
            }

            const sL = components.get("ScreenLocation") as ScreenLocationComponent;
            if (sL) {
                screenW = p.data.width;
                screenH = p.data.height;
                screenX = sL.data.x;
                screenY = sL.data.y;
                screenZ = sL.data.z ?? 0;
            }

            if (typeof screenW !== "undefined") {
                p.data.hovered = false;
                p.data.clicked = false;

                if (pointInBox(pointerX, pointerY, screenX, screenY, screenW, screenH)) {
                    eventTargets.push({
                        z: screenZ,
                        pD: p.data,
                    });
                }
            }
        });

        if (eventTargets.length) {
            const targetMaxZ = eventTargets.reduce((prevMax, candidate) => {
                return (candidate.z >= prevMax.z) ? candidate : prevMax;
            }, eventTargets[0]);
            targetMaxZ.pD.hovered = true;
            targetMaxZ.pD.clicked = this.pointerClicked;
        }

        this.pointerClicked = false;
    }
}
