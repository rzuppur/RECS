import Manager, { Query } from "../../engine/manager.js";
import WorldLocationData from "../../engine/components/worldLocationData.js";
import DrawableData from "../../engine/components/drawableData.js";
import PointableData from "../../engine/components/pointableData.js";
import System from "../../engine/systems/index.js";

export class TileSystem extends System {
    constructor() {
        super(["tile"]);
    }

    public initialize(query: Query): boolean {
        super.initialize(query);
        return true;
    }

    public tick(dt: number): void {
        this.query.getMatching().forEach(entityMatch => {
            const p = entityMatch.get("pointable") as PointableData;
            const d = entityMatch.get("drawable") as DrawableData;
            const t = entityMatch.get("tile");

            if (p.clicked) {
                t.clicked = true;
            }

            d.imageSrc = p.hovered ? "/game/assets/tiles/grass_hovered.png" : "/game/assets/tiles/grass.png";
            d.imageSrc = t.clicked ? "" : d.imageSrc;
        });
    }
}

export default class Tile {
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
            imageSrc: "/game/assets/tiles/grass.png",
        } as DrawableData);

        this.manager.setComponent(this.entity, "pointable", {
            width: tileSizePx,
            height: tileSizePx,
        } as PointableData);

        this.manager.setComponent(this.entity, "tile", {
            clicked: false,
        });
    }
}
