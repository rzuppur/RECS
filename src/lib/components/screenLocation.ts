import Component from "./index";
import type { ComponentData } from "./index";
import Vector2 from "../utils/vector2";

export interface ScreenLocationData extends ComponentData {
    /* Position on screen from top left corner */
    loc: Vector2;

    /* Drawing order */
    z?: number;
}

export default class ScreenLocationComponent extends Component {
    static key = "ScreenLocation";
    declare public data: ScreenLocationData;

    constructor(data?: ScreenLocationData) {
        super(ScreenLocationComponent.key, data);
    }

    beforeDestroy() {
        this.data.loc.free();
    }
}
