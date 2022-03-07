import Logger from "../../utils/logger";
import Vector2 from "../../utils/vector2";
import { Drawable } from "../../components/drawable";

const log = new Logger("Canvas");

const roundToSubpixel = (px: number): number => {
    return Math.floor(px * 10) / 10
};
const roundToPixel = (px: number): number => {
    return Math.floor(px);
};

export default class Canvas {
    public onSizeChange: (width: number, height: number) => void = () => {
    };

    private parentEl: HTMLElement;
    private readonly canvasEl: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly spriteMap: Map<string, HTMLImageElement> = new Map();

    private width: number = 1;
    private height: number = 1;

    private offsetX: number = 0;
    private offsetY: number = 0;

    private dpr: number;
    private smoothing: boolean = true;
    private pathSplitPoints = 5_000;
    private round: (x: number) => number;

    constructor() {
        log.new();

        this.canvasEl = document.createElement("canvas");
        this.ctx = this.canvasEl.getContext("2d", { alpha: false });
    }

    private setCanvasLogicalSize(width: number, height: number) {
        this.dpr = Math.max(window.devicePixelRatio || 1, 1);

        /**
         * Select rounding function
         *
         * Rounding to pixel is more performant in some cases, but causes jagged edges on low DPI screens.
         * High DPI screens need to render more pixels and usually do not need antialiasing since the individual pixels are not visible.
         */
        if (this.dpr > 2) {
            log.info("High resolution screen detected, will round to pixel");
            this.round = roundToPixel;
        } else {
            log.info("Low resolution screen detected, will round to subpixel");
            this.round = roundToSubpixel;
        }

        // Set CSS pixels size
        this.width = Math.floor(width);
        this.height = Math.floor(height);

        // Set actual screen pixels size
        this.canvasEl.width = this.width * this.dpr;
        this.canvasEl.height = this.height * this.dpr;

        // Smoothing will reset after a resize
        this.ctx.imageSmoothingEnabled = this.smoothing;

        // Emit resize event
        this.onSizeChange(this.width, this.height);
    }

    private moveTo(x: number, y: number): void {
        this.ctx.moveTo(this.round(x * this.dpr), this.round(y * this.dpr));
    }

    private lineTo(x: number, y: number): void {
        this.ctx.lineTo(this.round(x * this.dpr), this.round(y * this.dpr));
    }

    private fillRect(x: number, y: number, width: number, height: number): void {
        this.ctx.beginPath();
        this.ctx.fillRect(this.round(x * this.dpr), this.round(y * this.dpr), this.round(width * this.dpr), this.round(height * this.dpr));
    }

    private strokeRect(x: number, y: number, width: number, height: number): void {
        this.ctx.beginPath();
        this.ctx.strokeRect(this.round(x * this.dpr), this.round(y * this.dpr), this.round(width * this.dpr), this.round(height * this.dpr));
    }

    private fillEllipse(x: number, y: number, width: number, height: number, rotation: number): void {
        this.ctx.beginPath();
        this.ctx.ellipse(this.round(x * this.dpr), this.round(y * this.dpr), this.round(width * this.dpr), this.round(height * this.dpr), rotation, 0, Math.PI * 2);
        this.ctx.fill();
    }

    private strokeEllipse(x: number, y: number, width: number, height: number, rotation: number): void {
        this.ctx.beginPath();
        this.ctx.ellipse(this.round(x * this.dpr), this.round(y * this.dpr), this.round(width * this.dpr), this.round(height * this.dpr), rotation, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    private fillText(text: string, x: number, y: number): void {
        this.ctx.fillText(text, this.round(x * this.dpr), this.round(y * this.dpr));
    }

    private drawImage(image: CanvasImageSource, x: number, y: number, width: number, height: number): void {
        this.ctx.drawImage(image, this.round(x * this.dpr), this.round(y * this.dpr), this.round(width * this.dpr), this.round(height * this.dpr));
    }

    private set lineWidth(strokeWidth: number) {
        this.ctx.lineWidth = this.round(strokeWidth * this.dpr);
    }

    public mount(parentEl: HTMLElement): Canvas {
        this.parentEl = parentEl;
        this.parentEl.appendChild(this.canvasEl);
        this.setCanvasLogicalSize(this.parentEl.clientWidth, this.parentEl.clientHeight);

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const bCR = entry.target.getBoundingClientRect();
                this.offsetX = bCR.x;
                this.offsetY = bCR.y;
                this.setCanvasLogicalSize(entry.contentRect.width, entry.contentRect.height);
            }
        });
        resizeObserver.observe(this.parentEl);

        log.info(`mounted to <${parentEl.tagName.toLocaleLowerCase()}>`);
        return this;
    }

    public getSize(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }

    public getOffset(): Vector2 {
        return new Vector2(this.offsetX, this.offsetY);
    }

    public setSmoothing(smoothing: boolean): void {
        this.smoothing = smoothing;
        this.ctx.imageSmoothingEnabled = this.smoothing;
    }

    public clear(): Canvas {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        return this;
    }

    public drawRect(x: number, y: number, width: number = 1, height: number = 1, color: string = "#FFFFFF", alpha: number = 1): Canvas {
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.fillRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawRectStroke(x: number, y: number, width: number = 1, height: number = 1, color: string = "#FFFFFF", strokeWidth: number = 1, alpha: number = 1): Canvas {
        this.ctx.globalAlpha = alpha;
        this.lineWidth = strokeWidth;
        this.ctx.strokeStyle = color;
        this.strokeRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawEllipse(x: number, y: number, width: number = 1, height: number = 1, rotation: number = 0, color: string = "#FFFFFF", alpha: number = 1): Canvas {
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.fillEllipse(x, y, width, height, rotation);
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawEllipseStroke(x: number, y: number, width: number = 1, height: number = 1, rotation: number = 0, color: string = "#FFFFFF", strokeWidth: number = 1, alpha: number = 1): Canvas {
        this.ctx.globalAlpha = alpha;
        this.lineWidth = strokeWidth;
        this.ctx.strokeStyle = color;
        this.strokeEllipse(x, y, width, height, rotation);
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawPath(x: number, y: number, path: Array<Array<number>>, color: string = "#FFFFFF", alpha: number = 1, zoom: number = 1): Canvas {
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.moveTo(x, y);
        this.ctx.beginPath();
        path.forEach((point) => {
            this.lineTo(point[0] * zoom + x, point[1] * zoom + y);
        });
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawPathStroke(x: number, y: number, path: Array<Array<number>>, strokeColor: string = "#FFFFFF", strokeWidth: number = 1, alpha: number = 1, zoom: number = 1): Canvas {
        this.ctx.globalAlpha = alpha;
        this.lineWidth = strokeWidth;
        this.ctx.strokeStyle = strokeColor;
        this.moveTo(x, y);
        this.ctx.beginPath();
        let i = 0;
        path.forEach((point) => {
            i++;
            this.lineTo(point[0] * zoom + x, point[1] * zoom + y);
            if (i > this.pathSplitPoints) {
                this.ctx.stroke();
                this.ctx.beginPath();
                i = 0;
            }
        });
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawText(x: number, y: number, text: string, size: number = 16, color: string = "#FFFFFF", font: string = "sans-serif", fontWeight: number = 400, align: "left" | "center" | "right" = "left"): Canvas {
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.font = `${fontWeight} ${Math.floor(size * this.dpr)}px ${font}`;
        let offsetY = 0;
        text.split("\n").forEach(line => {
            this.fillText(line, x, y + offsetY);
            offsetY += size * 1.15;
        });
        return this;
    }

    public drawSprite(x: number, y: number, width: number, height: number, imageSrc: string, alpha: number = 1): Canvas {
        if (!this.spriteMap.has(imageSrc)) {
            const imageEl = new Image();
            imageEl.src = imageSrc;
            this.spriteMap.set(imageSrc, imageEl);
        }
        const image = this.spriteMap.get(imageSrc);
        this.ctx.globalAlpha = alpha;
        this.drawImage(image, x, y, width, height);
        this.ctx.globalAlpha = 1;
        return this;
    }

    public draw(x: number, y: number, drawable: Drawable, zoom = 1): Canvas {
        if (drawable.type === "RECT") {
            if (drawable.color) {
                this.drawRect(x * zoom, y * zoom, drawable.width * zoom, drawable.height * zoom, drawable.color, drawable.alpha);
            }
            if (drawable.strokeColor) {
                this.drawRectStroke(x * zoom, y * zoom, drawable.width * zoom, drawable.height * zoom, drawable.strokeColor, drawable.strokeWidth, drawable.alpha);
            }
        } else if (drawable.type === "ELLIPSE") {
            if (drawable.color) {
                this.drawEllipse(x * zoom, y * zoom, drawable.width * zoom, drawable.height * zoom, drawable.rotation, drawable.color, drawable.alpha);
            }
            if (drawable.strokeColor) {
                this.drawEllipseStroke(x * zoom, y * zoom, drawable.width * zoom, drawable.height * zoom, drawable.rotation, drawable.strokeColor, drawable.strokeWidth, drawable.alpha);
            }
        } else if (drawable.type === "PATH" || drawable.type === "PATH_FIXED_SIZE") {
            if (drawable.color) {
                this.drawPath(x * zoom, y * zoom, drawable.path, drawable.color, drawable.alpha, drawable.type === "PATH_FIXED_SIZE" ? 1 : zoom);
            }
            if (drawable.strokeColor) {
                this.drawPathStroke(x * zoom, y * zoom, drawable.path, drawable.strokeColor, drawable.strokeWidth, drawable.alpha, drawable.type === "PATH_FIXED_SIZE" ? 1 : zoom);
            }
        } else if (drawable.type === "TEXT") {
            this.drawText(x * zoom, y * zoom, drawable.content, drawable.size * zoom, drawable.color, drawable.font, drawable.fontWeight, drawable.align);
        } else if (drawable.type === "TEXT_FIXED_SIZE") {
            this.drawText(x * zoom, y * zoom, drawable.content, drawable.size, drawable.color, drawable.font, drawable.fontWeight, drawable.align);
        } else if (drawable.type === "SPRITE") {
            this.drawSprite(x * zoom, y * zoom, drawable.width * zoom, drawable.height * zoom, drawable.imageSrc, drawable.alpha);
        } else if (drawable.type === "SPRITE_FIXED_SIZE") {
            this.drawSprite(x * zoom, y * zoom, drawable.width, drawable.height, drawable.imageSrc, drawable.alpha);
        } else {
            log.warning(`Unknown drawable type: ${JSON.stringify(drawable)}`);
        }

        return this;
    }
}
