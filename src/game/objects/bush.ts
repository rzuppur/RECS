import Manager from "../../engine/manager.js";
import WorldLocationData from "../../engine/components/worldLocationData";
import DrawableData from "../../engine/components/drawableData";

export default class Bush {
    entity: string;
    manager: Manager;

    constructor(manager: Manager, x: number, y: number, tileSizePx: number) {
        this.manager = manager;
        this.entity = this.manager.createEntity();

        this.manager.setComponent(this.entity, "worldLocation", {
            x: x * tileSizePx,
            y: y * tileSizePx,
        } as WorldLocationData)

        this.manager.setComponent(this.entity, "drawable", {
            type: "SPRITE",
            width: tileSizePx,
            height: tileSizePx,
            imageSrc: "/game/assets/tiles/bush.png",
        } as DrawableData);
    }
}
