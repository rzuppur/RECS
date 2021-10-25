import System from "../index";
import Manager from "../../manager";
import Query from "../../query";
import Logger from "../../utils/logger";
import { pointInBox } from "../../utils/boundingBox";
import PointableComponent, { PointableData } from "../../components/pointable";
import WorldLocationComponent from "../../components/worldLocation";
import ScreenLocationComponent from "../../components/screenLocation";
import DisplaySystem from "../display/index";

const log = new Logger("PointerInputSystem");

export default class PointerSystem extends System {
    private displaySystem: DisplaySystem;

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

    private didWheel: boolean = false;
    public wheelDeltaX: number = 0;
    public wheelDeltaY: number = 0;

    public pointerScreenX: number = 0;
    public pointerScreenY: number = 0;
    public pointerWorldX: number = 0;
    public pointerWorldY: number = 0;

    public DRAG_START_THRESHOLD_PX: number = 6;

    constructor() {
        super("Pointer", [PointableComponent.key]);
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

    private wheelHandler(event: WheelEvent): void {
        this.didWheel = true;
        this.wheelDeltaX = event.deltaMode ? event.deltaX * 20 : event.deltaX; // Delta mode 0 is pixels, 1/2 is lines/pages
        this.wheelDeltaY = event.deltaMode ? event.deltaY * 20 : event.deltaY;
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

    public start(query: Query, manager: Manager): boolean {
        // todo: listen only on canvas area

        document.addEventListener("mousedown", this.mouseDownHandler.bind(this), false);
        document.addEventListener("mousemove", this.mouseMoveHandler.bind(this), false);
        document.addEventListener("mouseup", this.mouseUpHandler.bind(this), false);
        document.addEventListener("mouseout", this.mouseOutHandler.bind(this), false);

        document.addEventListener("touchstart", this.touchStartHandler.bind(this), false);
        document.addEventListener("touchmove", this.touchMoveHandler.bind(this), false);
        document.addEventListener("touchend", this.touchEndHandler.bind(this), false);
        document.addEventListener("touchcancel", this.touchEndHandler.bind(this), false);

        document.addEventListener("wheel", this.wheelHandler.bind(this), false);

        this.displaySystem = manager.getSystem("Display") as DisplaySystem;

        return super.start(query, manager);
    }

    public tick(dt: number): void {
        if (this.pointerDragging) this.resetDelta();

        const { offsetX, offsetY } = this.displaySystem.getOffset();
        const pointerX = this.pointerX - offsetX;
        const pointerY = this.pointerY - offsetY;
        const worldZoom = this.displaySystem.zoom;
        const worldOffsetX = this.displaySystem.offsetX;
        const worldOffsetY = this.displaySystem.offsetY;

        this.pointerScreenX = pointerX;
        this.pointerScreenY = pointerY;
        this.pointerWorldX = (pointerX / worldZoom) - worldOffsetX;
        this.pointerWorldY = (pointerY / worldZoom) - worldOffsetY;

        const eventTargets: { z: number; pD: PointableData; }[] = [];

        this.query.getMatching().forEach((components, entity) => {
            const p = Query.getComponent(components, PointableComponent);
            if (!this.pointerActive) {
                p.data.clicked = false;
                p.data.hovered = false;
                return;
            }

            let screenW, screenH, screenX, screenY, screenZ;

            const wL = components.get(WorldLocationComponent.key) as WorldLocationComponent;
            if (wL) {
                screenW = p.data.width * worldZoom;
                screenH = p.data.height * worldZoom;
                screenX = (wL.data.x + worldOffsetX) * worldZoom;
                screenY = (wL.data.y + worldOffsetY) * worldZoom;
                screenZ = wL.data.z ?? 0;
            }

            const sL = components.get(ScreenLocationComponent.key) as ScreenLocationComponent;
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

        if (this.didWheel) {
            this.didWheel = false;
        } else {
            this.wheelDeltaX = 0;
            this.wheelDeltaY = 0;
        }
    }
}
