import ComponentData from "./index";

interface Sizeable extends ComponentData {
    width: number;
    height: number;
}

interface DrawableRect extends Sizeable {
    type: "RECT";
    color?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

interface DrawableSprite extends Sizeable {
    type: "SPRITE";
    imageSrc: string;
    offsetX?: number;
    offsetY?: number;
}

interface DrawableText extends Sizeable {
    type: "TEXT";
    content: string;
    color?: string;
    size?: number;
    font?: string;
}

type DrawableData = DrawableRect | DrawableSprite | DrawableText;

export default DrawableData;
