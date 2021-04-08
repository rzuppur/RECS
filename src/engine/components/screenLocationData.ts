import ComponentData from "./index";

export default interface ScreenLocationData extends ComponentData {
    /* Position on screen from top left corner */
    x: number;
    y: number;

    /* Drawing order, not implemented */
    z?: number;
}
