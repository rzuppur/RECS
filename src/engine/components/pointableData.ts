import ComponentData from "./index";

export default interface PointableData extends ComponentData {
    width: number;
    height: number;
    hovered?: boolean;
    clicked?: boolean;
}
