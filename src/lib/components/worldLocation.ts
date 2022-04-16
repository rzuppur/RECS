import Component, { ComponentData } from "./index";
import Vector2 from "../utils/vector2";

export interface WorldLocationData extends ComponentData {
    /* Absolute position in 2D game world */
    loc: Vector2;

    /* Drawing order */
    z?: number;
}

export default class WorldLocationComponent extends Component {
    static key = "WorldLocation";
    public data: WorldLocationData;

    constructor(data?: WorldLocationData) {
        super(WorldLocationComponent.key, data);
    }
}
