import Component, { ComponentData } from "./index";
import Vector2 from "../utils/vector2";

interface DrawableBase extends ComponentData {
    offset?: Vector2;
}

interface Sizeable extends DrawableBase {
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
    alpha?: number;
}

interface DrawableSpriteFixed extends Sizeable {
    type: "SPRITE_FIXED_SIZE";
    imageSrc: string;
    alpha?: number;
}

interface DrawableText extends DrawableBase {
    type: "TEXT";
    content: string;
    color?: string;
    size?: number;
    font?: string;
    align?: "left" | "center" | "right";
    fontWeight?: number;
}

interface DrawableTextFixed extends DrawableBase {
    type: "TEXT_FIXED_SIZE";
    content: string;
    color?: string;
    size?: number;
    font?: string;
    align?: "left" | "center" | "right";
    fontWeight?: number;
}

interface DrawablePath extends DrawableBase {
    type: "PATH";
    path: Array<Array<number>>; // "[[X1, Y1], [X2, Y2], ... , [Xn, Yn]]"
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    alpha?: number;
}

interface DrawablePathFixed extends DrawableBase {
    type: "PATH_FIXED_SIZE";
    path: Array<Array<number>>; // "[[X1, Y1], [X2, Y2], ... , [Xn, Yn]]"
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
    alpha?: number;
}

export type Drawable = DrawableRect | DrawableSprite | DrawableSpriteFixed | DrawableText | DrawableTextFixed | DrawablePath | DrawablePathFixed;

export interface DrawableData {
    drawables: Drawable[];
}

export default class DrawableComponent extends Component {
    static key = "Drawable";
    public data: DrawableData;

    constructor(data?: DrawableData) {
        super(DrawableComponent.key, data);
    }
}
