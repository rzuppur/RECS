import Component, { ComponentData } from "./index";

export interface WorldLocationData extends ComponentData {
    /* Absolute position in 2D game world */
    x: number;
    y: number;

    /* Drawing order */
    z?: number;
}

export default class WorldLocationComponent extends Component {
    public data: WorldLocationData;

    constructor(data?: WorldLocationData) {
        super("WorldLocation", data);
    }
}
