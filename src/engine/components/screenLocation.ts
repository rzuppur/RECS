import Component, { ComponentData } from "./index";
import Vector2 from "../utils/vector2";

export interface ScreenLocationData extends ComponentData {
    /* Position on screen from top left corner */
    loc: Vector2;

    /* Drawing order */
    z?: number;
}

export default class ScreenLocationComponent extends Component {
    static key = "ScreenLocation";
    public data: ScreenLocationData;

    constructor(data?: ScreenLocationData) {
        super(ScreenLocationComponent.key, data);
    }
}
