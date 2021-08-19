import Logger from "../../utils/logger";
import { DrawableData } from "../../components/drawable";

const log = new Logger("Canvas");

export default class Canvas {
    public onSizeChange: (width: number, height: number) => void = () => {};

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

    constructor() {
        log.new();

        this.canvasEl = document.createElement("canvas");
        this.ctx = this.canvasEl.getContext("2d", { alpha: false });
    }

    private setCanvasLogicalSize(width: number, height: number) {
        this.dpr = Math.max(window.devicePixelRatio || 1, 1);

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

    public getOffset(): { offsetX: number, offsetY: number } {
        return { offsetX: this.offsetX, offsetY: this.offsetY };
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
        this.ctx.fillRect(x * this.dpr, y * this.dpr, width * this.dpr, height * this.dpr);
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawRectStroke(x: number, y: number, width: number = 1, height: number = 1, color: string = "#FFFFFF", strokeWidth: number = 1, alpha: number = 1): Canvas {
        this.ctx.globalAlpha = alpha;
        const strokeWidthRealPixels = strokeWidth * this.dpr;
        this.ctx.lineWidth = strokeWidthRealPixels;
        this.ctx.strokeStyle = color;
        this.ctx.strokeRect(x * this.dpr + strokeWidthRealPixels / 2, y * this.dpr + strokeWidthRealPixels / 2, width * this.dpr - strokeWidthRealPixels, height * this.dpr - strokeWidthRealPixels);
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawText(x: number, y: number, text: string, size: number = 16, color: string = "#FFFFFF", font: string = "sans-serif", fontWeight: number = 400): Canvas {
        this.ctx.fillStyle = color;
        this.ctx.font = `${fontWeight} ${Math.round(size * this.dpr)}px ${font}`;
        let offsetY = 0;
        text.split("\n").forEach(line => {
            this.ctx.fillText(line, x * this.dpr, (y * this.dpr) + offsetY);
            offsetY += size * this.dpr * 1.15;
        });
        return this;
    }

    public drawPath(x: number, y: number, path: string, strokeColor: string = "#FFFFFF", strokeWidth: number = 1, alpha: number = 1): Canvas {
        this.ctx.globalAlpha = alpha;
        this.ctx.lineWidth = strokeWidth * this.dpr;
        this.ctx.strokeStyle = strokeColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        path.split(",").filter(Boolean).forEach((point) => {
            const [pX, pY] = point.split(" ").filter(Boolean);
            this.ctx.lineTo(+pX + x, +pY + y);
        });
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
        return this;
    }

    public drawSprite(x: number, y: number, width: number, height: number, imageSrc: string): Canvas {
        if (!this.spriteMap.has(imageSrc)) {
            const imageEl = new Image();
            imageEl.src = imageSrc;
            this.spriteMap.set(imageSrc, imageEl);
        }
        const image = this.spriteMap.get(imageSrc);
        this.ctx.drawImage(image, x * this.dpr, y * this.dpr, width * this.dpr, height * this.dpr);
        return this;
    }

    public draw(x: number, y: number, drawable: DrawableData): Canvas {
        if (drawable.type === "RECT") {
            if (drawable.strokeColor) {
                this.drawRectStroke(x, y, drawable.width, drawable.height, drawable.strokeColor, drawable.strokeWidth, drawable.alpha);
            } else {
                this.drawRect(x, y, drawable.width, drawable.height, drawable.color, drawable.alpha);
            }
        } else if (drawable.type === "TEXT") {
            this.drawText(x, y, drawable.content, drawable.size, drawable.color, drawable.font, drawable.fontWeight);
        } else if (drawable.type === "PATH") {
            this.drawPath(x, y, drawable.path, drawable.strokeColor, drawable.strokeWidth, drawable.alpha);
        } else if (drawable.type === "SPRITE") {
            this.drawSprite(x + (drawable.offsetX ?? 0), y + (drawable.offsetY ?? 0), drawable.width, drawable.height, drawable.imageSrc);
        } else {
            log.warning(`Unknown drawable type: ${JSON.stringify(drawable)}`);
        }

        return this;
    }
}
