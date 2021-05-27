import Component, { ComponentData } from "./index";

interface Sizeable extends ComponentData {
    width: number;
    height: number;
}

interface DrawableRect extends Sizeable {
    type: "RECT";
    color?: string;
    alpha?: number;
    strokeColor?: string;
    strokeWidth?: number;
}

interface DrawableSprite extends Sizeable {
    type: "SPRITE";
    imageSrc: string;
    offsetX?: number;
    offsetY?: number;
}

interface DrawableText extends ComponentData {
    type: "TEXT";
    content: string;
    color?: string;
    size?: number;
    font?: string;
    fontWeight?: number;
}

export type DrawableData = DrawableRect | DrawableSprite | DrawableText;

export default class DrawableComponent extends Component {
    public data: DrawableData;

    constructor(data?: DrawableData) {
        super("Drawable", data);
    }
}
