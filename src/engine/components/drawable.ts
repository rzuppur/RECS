import Component, { ComponentData } from "./index";

interface Sizeable extends ComponentData {
    width: number;
    height: number;
}

interface DrawableRect extends Sizeable {
    type: "RECT";
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    alpha?: number;
}

interface DrawableSprite extends Sizeable {
    type: "SPRITE";
    imageSrc: string;
    offsetX?: number;
    offsetY?: number;
    alpha?: number;
}

interface DrawableText extends ComponentData {
    type: "TEXT";
    content: string;
    color?: string;
    size?: number;
    font?: string;
    fontWeight?: number;
}

interface DrawablePath extends ComponentData {
    type: "PATH";
    path: Array<Array<number>>; // "[[X1, Y1], [X2, Y2], ... , [Xn, Yn]]"
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    alpha?: number;
}

export type DrawableData = DrawableRect | DrawableSprite | DrawableText | DrawablePath;

export default class DrawableComponent extends Component {
    static key = "Drawable";
    public data: DrawableData;

    constructor(data?: DrawableData) {
        super(DrawableComponent.key, data);
    }
}
