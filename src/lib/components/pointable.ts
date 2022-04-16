import Component, { ComponentData } from "./index";

export interface PointableData extends ComponentData {
    width: number;
    height: number;
    hovered?: boolean;
    clicked?: boolean;
    dragged?: boolean;
    draggedDeltaX?: number;
    draggedDeltaY?: number;
    draggedDeltaXWorld?: number;
    draggedDeltaYWorld?: number;
}

export default class PointableComponent extends Component {
    static key = "Pointable";
    public data: PointableData;

    constructor(data?: PointableData) {
        super(PointableComponent.key, data);
    }
}
