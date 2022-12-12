import { LoggerFactory, Logger } from "../../utils/logger";
import Vector2 from "../../utils/vector2";
import type { Drawable } from "../../components/drawable";
import { clamp } from "../../utils/math";
import { boxInBox } from "../../utils/boundingBox";

export type CanvasTextMetrics = {
    width: number;
};

const roundToSubpixel = (px: number): number => {
    return Math.floor(px * 10) / 10
};
const roundToPixel = (px: number): number => {
    return Math.floor(px);
};

/**
 * Source:
 * https://www.tinaja.com/glib/ellipse4.pdf
 * https://stackoverflow.com/questions/8714857/very-large-html5-canvas-circle-imprecise
 */
const circleMagicNumber = 0.551784;

export default class Canvas {
    public onSizeChange: (width: number, height: number) => void = () => {
    };

    private parentEl: HTMLElement;
    private readonly canvasEl: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly spriteMap: Map<string, HTMLImageElement> = new Map();

    private width: number = 1;
    private height: number = 1;
    private realWidth: number = 1;
    private realHeight: number = 1;

    private offset: Vector2 = Vector2.new();

    private dpr: number;
    private smoothing: boolean = true;
    private pathSplitPoints = 5_000;
    private round: (x: number) => number;

    private fontCache: string = "";
    private textAlignCache: string = "";

    private log: Logger;

    constructor() {
        this.log = LoggerFactory.getLogger("Canvas");
        this.log.new();

        this.canvasEl = document.createElement("canvas");
        this.ctx = this.canvasEl.getContext("2d", { alpha: false });
        // @ts-ignore
        document.fonts.ready.then(() => {
            this.fontCache = "";
            this.textAlignCache = "";
        });
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
            this.log.info("High resolution screen detected, will round to pixel");
            this.round = roundToPixel;
        } else {
            this.log.info("Low resolution screen detected, will round to subpixel");
            this.round = roundToSubpixel;
        }

        // Set CSS pixels size
        this.width = Math.floor(width);
        this.height = Math.floor(height);

        // Set actual screen pixels size
        this.canvasEl.width = this.width * this.dpr;
        this.canvasEl.height = this.height * this.dpr;
        this.realWidth = this.width * this.dpr;
        this.realHeight = this.height * this.dpr;

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
        this.ctx.fillRect(this.round(x), this.round(y), this.round(width), this.round(height));
    }

    private strokeRect(x: number, y: number, width: number, height: number): void {
        this.ctx.beginPath();
        this.ctx.strokeRect(this.round(x), this.round(y), this.round(width), this.round(height));
    }

    private ellipse(x: number, y: number, width: number, height: number, rotation: number): void {
        const largeLimit = 1e6 / this.dpr;
        if (width > largeLimit || height > largeLimit) {
            const maxSize = Math.max(width, height);
            const si = Math.sin(rotation);
            const co = Math.cos(rotation);
            const rotate = (xS: number, yS: number) => {
                if (rotation === 0) return [xS, yS];
                xS -= x;
                yS -= y;
                const xR = xS * co - yS * si;
                const yR = xS * si + yS * co;
                return [xR + x, yR + y]
            };

            const path = [];
            const steps = 10000;
            for (let step = 0; step < steps; step += 1) {
                const angle = step * Math.PI / steps * 2;
                const forcePoint = step == 0 || step == 250 || step == 500 || step == 750;
                const xP = x + width * Math.cos(angle);
                if (!forcePoint && Math.abs(xP) > maxSize / 50) continue;
                const yP = y - height * Math.sin(angle);
                if (!forcePoint && Math.abs(yP) > maxSize / 50 ) continue;
                const pointClamp = clamp(Math.max(this.width, this.height) * 4, maxSize / 100, 1e7);
                path.push(rotate(clamp(-pointClamp, xP, pointClamp), clamp(-pointClamp, yP, pointClamp)));
            }

            this.ctx.moveTo(path[0][0], path[0][1]);
            this.ctx.beginPath();
            path.forEach((c) => this.ctx.lineTo(c[0], c[1]));
            this.ctx.closePath();

            return;
        }

        /*
        this.ctx.save();
        this.ctx.translate(x * this.dpr, y * this.dpr);
        this.ctx.rotate(rotation);
        this.ctx.scale(width * this.dpr, height * this.dpr);
        this.ctx.beginPath();
        this.ctx.moveTo(1, 0);
        this.ctx.bezierCurveTo(1, -circleMagicNumber, circleMagicNumber, -1, 0, -1);
        this.ctx.bezierCurveTo(-circleMagicNumber, -1, -1, -circleMagicNumber, -1, 0);
        this.ctx.bezierCurveTo(-1, circleMagicNumber, -circleMagicNumber, 1, 0, 1);
        this.ctx.bezierCurveTo(circleMagicNumber, 1, 1, circleMagicNumber, 1, 0);
        this.ctx.closePath();
        this.ctx.restore();
        */

        this.ctx.beginPath();
        this.ctx.ellipse(this.round(x), this.round(y), this.round(width), this.round(height), rotation, 0, Math.PI * 2);
    }

    private fillText(text: string, x: number, y: number): void {
        this.ctx.fillText(text, this.round(x * this.dpr), this.round(y * this.dpr));
    }

    private drawImage(image: CanvasImageSource, x: number, y: number, width: number, height: number): void {
        this.ctx.drawImage(image, this.round(x), this.round(y), this.round(width), this.round(height));
    }

    private set lineWidth(strokeWidth: number) {
        this.ctx.lineWidth = this.round(strokeWidth * this.dpr);
    }

    private set fontString(fontString: string) {
        if (this.fontCache !== fontString) {
            this.ctx.font = fontString;
            this.fontCache = fontString;
        }
    }
    private set textAlign(align: CanvasTextAlign) {
        if (this.textAlignCache !== align) {
            this.ctx.textAlign = align;
            this.textAlignCache = align;
        }
    }

    private isInView(x: number, y: number, width: number, height: number): [number, number, number, number, boolean] {
        x = x * this.dpr;
        y = y * this.dpr;
        width = width * this.dpr;
        height = height * this.dpr;
        return [x, y, width, height, boxInBox(x, y, width, height, 0, 0, this.realWidth, this.realHeight)];
    }

    public mount(parentEl: HTMLElement): void {
        this.parentEl = parentEl;
        this.parentEl.appendChild(this.canvasEl);
        this.setCanvasLogicalSize(this.parentEl.clientWidth, this.parentEl.clientHeight);

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const bCR = entry.target.getBoundingClientRect();
                this.offset = Vector2.new(bCR.x, bCR.y);
                this.setCanvasLogicalSize(entry.contentRect.width, entry.contentRect.height);
            }
        });
        resizeObserver.observe(this.parentEl);

        this.log.info(`Mounted to <${parentEl.tagName.toLocaleLowerCase()}>`);
    }

    public getSize(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }

    public getOffset(): Vector2 {
        return this.offset.copy();
    }

    public setSmoothing(smoothing: boolean): void {
        this.smoothing = smoothing;
        this.ctx.imageSmoothingEnabled = this.smoothing;
    }

    public clear(): void {
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    public drawRect(x: number, y: number, width: number = 1, height: number = 1, color: string = "#FFFFFF", alpha: number = 1): void {
        const [xS, yS, widthS, heightS, inView] = this.isInView(x, y, width, height);
        if (!inView) return;

        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.fillRect(xS, yS, widthS, heightS);
        this.ctx.globalAlpha = 1;
    }

    public drawRectStroke(x: number, y: number, width: number = 1, height: number = 1, color: string = "#FFFFFF", strokeWidth: number = 1, alpha: number = 1): void {
        const [xS, yS, widthS, heightS, inView] = this.isInView(x, y, width, height);
        if (!inView) return;

        this.ctx.globalAlpha = alpha;
        this.lineWidth = strokeWidth;
        this.ctx.strokeStyle = color;
        this.strokeRect(xS, yS, widthS, heightS);
        this.ctx.globalAlpha = 1;
    }

    public drawEllipse(x: number, y: number, width: number = 1, height: number = 1, rotation: number = 0, color: string = "#FFFFFF", alpha: number = 1): void {
        const longestSide = Math.max(width, height); // to account for rotation
        const [_x, _y, _w, _h, inView] = this.isInView(x - longestSide, y - longestSide, longestSide * 2, longestSide * 2);
        if (!inView) return;

        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.ellipse(x * this.dpr, y * this.dpr, width * this.dpr, height * this.dpr, rotation);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    public drawEllipseStroke(x: number, y: number, width: number = 1, height: number = 1, rotation: number = 0, color: string = "#FFFFFF", strokeWidth: number = 1, alpha: number = 1): void {
        const longestSide = Math.max(width, height); // to account for rotation
        const [_x, _y, _w, _h, inView] = this.isInView(x - longestSide, y - longestSide, longestSide * 2, longestSide * 2);
        if (!inView) return;

        this.ctx.globalAlpha = alpha;
        this.lineWidth = strokeWidth;
        this.ctx.strokeStyle = color;
        this.ellipse(x * this.dpr, y * this.dpr, width * this.dpr, height * this.dpr, rotation);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    public drawPath(x: number, y: number, path: Array<Array<number>>, color: string = "#FFFFFF", alpha: number = 1, zoom: number = 1): void {
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        this.moveTo(x, y);
        this.ctx.beginPath();
        path.forEach((point) => {
            this.lineTo(point[0] * zoom + x, point[1] * zoom + y);
        });
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    public drawPathStroke(x: number, y: number, path: Array<Array<number>>, strokeColor: string = "#FFFFFF", strokeWidth: number = 1, alpha: number = 1, zoom: number = 1): void {
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
    }

    public measureText(text: string, size: number = 16, font: string = "sans-serif", fontWeight: number = 400): CanvasTextMetrics {
        this.fontString = `${fontWeight} ${Math.floor(size * this.dpr)}px ${font}`;
        const measure = this.ctx.measureText(text);
        return { width: measure.width / this.dpr };
    }

    public drawText(x: number, y: number, text: string, size: number = 16, color: string = "#FFFFFF", font: string = "sans-serif", fontWeight: number = 400, align: "left" | "center" | "right" = "left"): void {
        this.ctx.fillStyle = color;
        this.textAlign = align;
        this.fontString = `${fontWeight} ${Math.floor(size * this.dpr)}px ${font}`;
        let offsetY = 0;
        text.split("\n").forEach(line => {
            this.fillText(line, x, y + offsetY);
            offsetY += size * 1.15;
        });
    }

    public drawSprite(x: number, y: number, width: number, height: number, imageSrc: string, alpha: number = 1): void {
        const [xS, yS, widthS, heightS, inView] = this.isInView(x, y, width, height);
        if (!inView) return;

        if (!this.spriteMap.has(imageSrc)) {
            const imageEl = new Image();
            imageEl.src = imageSrc;
            this.spriteMap.set(imageSrc, imageEl);
        }
        const image = this.spriteMap.get(imageSrc);
        this.ctx.globalAlpha = alpha;
        this.drawImage(image, xS, yS, widthS, heightS);
        this.ctx.globalAlpha = 1;
    }

    public draw(x: number, y: number, drawable: Drawable, zoom = 1): void {
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
            this.log.warning(`Unknown drawable type: ${JSON.stringify(drawable)}`);
        }
    }
}
