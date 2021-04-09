import Logger from "../../utils/logger";
import {DrawableData} from "../../components/drawable";

const log = new Logger("Canvas");

export default class Canvas {
    private parentEl: HTMLElement;
    private readonly canvasEl: HTMLCanvasElement;
    private readonly canvas2dContext: CanvasRenderingContext2D;
    private readonly spriteMap: Map<string, HTMLImageElement> = new Map();

    private width: number = 1;
    private height: number = 1;

    private dpr = Math.max(window.devicePixelRatio || 1, 1);
    private smoothing: boolean = true;

    constructor() {
        log.new();

        this.canvasEl = document.createElement("canvas");
        this.canvas2dContext = this.canvasEl.getContext("2d", { alpha: false });
    }

    private resizeFillParent(): void {
        this.width = this.parentEl.clientWidth;
        this.height = this.parentEl.clientHeight;

        this.canvasEl.width = this.width * this.dpr;
        this.canvasEl.height = this.height * this.dpr;

        this.canvas2dContext.imageSmoothingEnabled = this.smoothing;

        log.info(`${this.width} x ${this.height} px @${this.dpr}x`);
    }

    public mount(parentEl: HTMLElement): Canvas {
        this.parentEl = parentEl;
        this.parentEl.appendChild(this.canvasEl);

        this.resizeFillParent();
        window.addEventListener("resize", this.resizeFillParent.bind(this), false);

        log.info(`mounted to <${parentEl.tagName.toLocaleLowerCase()}>`);
        return this;
    }

    public getSize(): { width: number, height: number } {
        return { width: this.width, height: this.height };
    }

    public setSmoothing(smoothing: boolean): void {
        this.smoothing = smoothing;
        this.canvas2dContext.imageSmoothingEnabled = this.smoothing;
    }

    public clear(): Canvas {
        this.canvas2dContext.fillStyle = "#000000";
        this.canvas2dContext.fillRect(0, 0, this.canvas2dContext.canvas.width, this.canvas2dContext.canvas.height);
        return this;
    }

    public drawRect(x: number, y: number, width: number = 1, height: number = 1, color: string = "#FFFFFF", alpha: number = 1): Canvas {
        this.canvas2dContext.globalAlpha = alpha;
        this.canvas2dContext.fillStyle = color;
        this.canvas2dContext.fillRect(x * this.dpr, y * this.dpr, width * this.dpr, height * this.dpr);
        this.canvas2dContext.globalAlpha = 1;
        return this;
    }

    public drawRectStroke(x: number, y: number, width: number = 1, height: number = 1, color: string = "#FFFFFF", stroke: number = 1, alpha: number = 1): Canvas {
        this.canvas2dContext.globalAlpha = alpha;
        const strokeWidth = stroke * this.dpr;
        this.canvas2dContext.lineWidth = strokeWidth;
        this.canvas2dContext.strokeStyle = color;
        this.canvas2dContext.strokeRect(x * this.dpr + strokeWidth / 2, y * this.dpr + strokeWidth / 2, width * this.dpr - strokeWidth, height * this.dpr - strokeWidth);
        this.canvas2dContext.globalAlpha = 1;
        return this;
    }

    public drawText(x: number, y: number, text: string, size: number = 16, color: string = "#FFFFFF", font: string = "sans-serif", fontWeight: number = 400): Canvas {
        this.canvas2dContext.fillStyle = color;
        this.canvas2dContext.font = `${fontWeight} ${Math.round(size * this.dpr)}px ${font}`;
        let offsetY = 0;
        text.split("\n").forEach(line => {
            this.canvas2dContext.fillText(line, x * this.dpr, (y * this.dpr) + offsetY);
            offsetY += size * this.dpr * 1.15;
        });
        return this;
    }

    public drawSprite(x: number, y: number, width: number, height: number, imageSrc: string): Canvas {
        if (!this.spriteMap.has(imageSrc)) {
            const imageEl = new Image();
            imageEl.src = imageSrc;
            this.spriteMap.set(imageSrc, imageEl);
        }
        const image = this.spriteMap.get(imageSrc);
        this.canvas2dContext.drawImage(image, x * this.dpr, y * this.dpr, width * this.dpr, height * this.dpr);
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
        } else if (drawable.type === "SPRITE") {
            this.drawSprite(x + (drawable.offsetX ?? 0), y + (drawable.offsetY ?? 0), drawable.width, drawable.height, drawable.imageSrc);
        } else {
            log.warning(`Unknown drawable type: ${JSON.stringify(drawable)}`);
        }

        return this;
    }
}
