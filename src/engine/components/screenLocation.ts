import Component, { ComponentData } from "./index";

export interface ScreenLocationData extends ComponentData {
    /* Position on screen from top left corner */
    x: number;
    y: number;

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
