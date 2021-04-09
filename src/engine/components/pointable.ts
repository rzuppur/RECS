import Component, {ComponentData} from "./index";

export interface PointableData extends ComponentData {
    width: number;
    height: number;
    hovered?: boolean;
    clicked?: boolean;
}

export default class PointableComponent extends Component {
    public data: PointableData;

    constructor(data?: PointableData) {
        super("Pointable", data);
    }
}
