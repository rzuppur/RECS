import System from "../index";
import type Manager from "../../manager";
import Query from "../../query";
import { LoggerFactory, Logger } from "../../utils/logger";
import { pointInBox } from "../../utils/boundingBox";
import PointableComponent from "../../components/pointable";
import WorldLocationComponent from "../../components/worldLocation";
import ScreenLocationComponent from "../../components/screenLocation";
import type DisplaySystem from "../display/index";

export default class PointerSystem extends System {
    private displaySystem: DisplaySystem;

    private pointerLastX: number = 0;
    private pointerLastY: number = 0;

    private pointerX: number = 0;
    private pointerY: number = 0;

    private pointerDownStartX: number = 0;
    private pointerDownStartY: number = 0;

    private didMove: boolean = false;
    public dragStartPointable: PointableComponent = null;
    private pointerDown: boolean = false;
    private pointerDragging: boolean = false;
    private pointerClicked: boolean = false;
    private pointerActive: boolean = false;
    private pointerDragReleased: boolean = false;
    public pointerClickedEmpty: boolean = false;
    public pointerEmptyDragReleased: boolean = false;

    private didWheel: boolean = false;
    public wheelDeltaX: number = 0;
    public wheelDeltaY: number = 0;

    public pointerScreenX: number = 0;
    public pointerScreenY: number = 0;
    public pointerWorldX: number = 0;
    public pointerWorldY: number = 0;
    public pointerDeltaX: number = 0;
    public pointerDeltaY: number = 0;

    public DRAG_START_THRESHOLD_PX: number = 2;

    private log: Logger;

    constructor() {
        super("Pointer", [PointableComponent.key]);
        this.log = LoggerFactory.getLogger("PointerSystem");
        this.log.new();
    }

    private onPointerDown(x: number, y: number) {
        this.pointerDown = true;

        this.pointerX = this.pointerLastX = this.pointerDownStartX = x;
        this.pointerY = this.pointerLastY = this.pointerDownStartY = y;
    }

    private onPointerMove(x: number, y: number) {
        this.didMove = true;
        this.pointerX = x;
        this.pointerY = y;

        if (!this.pointerDragging && this.pointerDown) {
            if (Math.abs(this.pointerDownStartX - this.pointerX) > this.DRAG_START_THRESHOLD_PX
                || Math.abs(this.pointerDownStartY - this.pointerY) > this.DRAG_START_THRESHOLD_PX) {
                this.pointerDragging = true;
            }
        }
    }

    private onPointerUp() {
        if (this.pointerDown && !this.pointerDragging) this.pointerClicked = true;
        if (this.pointerDown && this.pointerDragging) this.pointerDragReleased = true;
        this.pointerDown = false;
        this.pointerDragging = false;
        this.dragStartPointable = null;
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
        const { x: offsetX, y: offsetY } = this.displaySystem.getOffset().release();
        const pointerX = this.pointerX - offsetX;
        const pointerY = this.pointerY - offsetY;
        const worldZoom = this.displaySystem.zoom;
        const worldOffsetX = this.displaySystem.offsetX;
        const worldOffsetY = this.displaySystem.offsetY;

        this.pointerScreenX = pointerX;
        this.pointerScreenY = pointerY;
        this.pointerWorldX = (pointerX / worldZoom) - worldOffsetX;
        this.pointerWorldY = (pointerY / worldZoom) - worldOffsetY;

        const eventTargets: { z: number; p: PointableComponent; }[] = [];

        this.query.getMatching().forEach((components, entity) => {
            const p = Query.getComponent(components, PointableComponent);
            if (!this.pointerDragging) {
                p.data.dragged = false;
                p.data.draggedDeltaX = 0;
                p.data.draggedDeltaY = 0;
                p.data.draggedDeltaXWorld = 0;
                p.data.draggedDeltaYWorld = 0;
            }
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
                screenX = (wL.data.loc.x + worldOffsetX) * worldZoom;
                screenY = (wL.data.loc.y + worldOffsetY) * worldZoom;
                screenZ = wL.data.z ?? 0;
            }

            const sL = components.get(ScreenLocationComponent.key) as ScreenLocationComponent;
            if (sL) {
                screenW = p.data.width;
                screenH = p.data.height;
                screenX = sL.data.loc.x;
                screenY = sL.data.loc.y;
                screenZ = sL.data.z ?? 0;
            }

            if (typeof screenW !== "undefined") {
                p.data.hovered = false;
                p.data.clicked = false;

                if (pointInBox(pointerX, pointerY, screenX, screenY, screenW, screenH)) {
                    eventTargets.push({ z: screenZ, p });
                }
            }
        });

        this.pointerClickedEmpty = false;
        this.pointerEmptyDragReleased = false;
        if (eventTargets.length) {
            const targetMaxZ = eventTargets.reduce((prevMax, candidate) => {
                return (candidate.z >= prevMax.z) ? candidate : prevMax;
            }, eventTargets[0]);
            targetMaxZ.p.data.hovered = true;
            targetMaxZ.p.data.clicked = this.pointerClicked;
            if (this.pointerDown && !this.pointerDragging && !this.dragStartPointable) {
                this.dragStartPointable = targetMaxZ.p;
            }
        } else if (this.pointerClicked) {
            this.pointerClickedEmpty = true;
        } else if (this.pointerDragReleased) {
            this.pointerEmptyDragReleased = true;
        }

        if (this.pointerDragging && this.dragStartPointable) {
            this.dragStartPointable.data.dragged = true;
            this.dragStartPointable.data.draggedDeltaX = this.pointerDeltaX;
            this.dragStartPointable.data.draggedDeltaY = this.pointerDeltaY;
            this.dragStartPointable.data.draggedDeltaXWorld = this.pointerDeltaX / this.displaySystem.zoom;
            this.dragStartPointable.data.draggedDeltaYWorld = this.pointerDeltaY / this.displaySystem.zoom;
        }

        this.pointerClicked = false;
        this.pointerDragReleased = false;

        if (this.didMove) {
            this.didMove = false;
            const deltaX = this.pointerLastX - this.pointerX
            const deltaY = this.pointerLastY - this.pointerY
            this.pointerDeltaX = Math.round(deltaX * 100) / 100;
            this.pointerDeltaY = Math.round(deltaY * 100) / 100;
            this.pointerLastX = this.pointerX;
            this.pointerLastY = this.pointerY;
        } else {
            this.resetDelta();
        }

        if (this.didWheel) {
            this.didWheel = false;
        } else {
            this.wheelDeltaX = 0;
            this.wheelDeltaY = 0;
        }
    }
}
