import ComponentData from "./index";

export default interface WorldLocationData extends ComponentData {
    /* Absolute position in 2D game world */
    x: number;
    y: number;

    /* Drawing order, not implemented */
    z?: number;
}
