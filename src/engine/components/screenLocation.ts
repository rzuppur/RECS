import Component, {ComponentData} from "./index";

export interface ScreenLocationData extends ComponentData {
    /* Position on screen from top left corner */
    x: number;
    y: number;

    /* Drawing order */
    z?: number;
}

export default class ScreenLocationComponent extends Component {
    public data: ScreenLocationData;

    constructor(data?: ScreenLocationData) {
        super("ScreenLocation", data);
    }
}
