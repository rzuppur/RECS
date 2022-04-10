import { Component, ComponentData, DrawableComponent, Entity, Manager, Query, System, Vector2, WorldLocationComponent } from "../engine";
import { InterpolatedValue, InterpolateType } from "../engine/utils/math";

export interface AnimationData extends ComponentData {
    id: string;
}

export class AnimationComponent extends Component {
    static key = "Animation";
    public data: AnimationData;

    constructor(data?: AnimationData) {
        super(AnimationComponent.key, data);
    }
}

const range = 80;

export class AnimationSystem extends System {
    private demoEntities: Map<Entity, InterpolatedValue> = new Map();

    constructor() {
        super("Animation", [AnimationComponent.key]);
    }

    public start(query: Query, manager: Manager): boolean {
        let y = 0;
        ["NEAREST", "LINEAR", "EASE"].forEach((type: InterpolateType) => {
            const background = manager.createEntity();
            manager.setComponent(background, new WorldLocationComponent({ loc: new Vector2(-range / 2, y) }));
            manager.setComponent(background, new DrawableComponent({
                drawables: [
                    { type: "RECT", width: range + 10, height: 10, strokeColor: "#666" },
                    { type: "TEXT", size: 4, color: "#fff", content: type },
                ],
            }));

            const entity = manager.createEntity();
            manager.setComponent(entity, new AnimationComponent({ id: type }));
            manager.setComponent(entity, new WorldLocationComponent({ loc: new Vector2(-range / 2, y) }));
            manager.setComponent(entity, new DrawableComponent({
                drawables: [
                    { type: "RECT", width: 10, height: 10, color: "#fff" },
                ],
            }));
            y += 20;

            const ease = new InterpolatedValue(-range / 2, type);
            ease.setInterpolate(range / 2);
            ease.onComplete = () => {
                setTimeout(() => ease.setInterpolate(-ease.value), 500);
            };

            this.demoEntities.set(entity, ease);
        });

        return super.start(query, manager);
    }

    public tick(dt: number, manager: Manager): void {
        this.query.getMatching().forEach((components, entity) => {
            const ease = this.demoEntities.get(entity);
            const { data: location } = Query.getComponent(components, WorldLocationComponent);
            location.loc = new Vector2(ease.get(), location.loc.y);
            const { data: drawable } = Query.getComponent(components, DrawableComponent);
            drawable.drawables[0].color = ease.easing ? "#ff0" : "#fff";
        });
    }
}

export function initializeAnimations(manager: Manager): AnimationSystem {
    manager.registerComponent(new AnimationComponent());

    const system = new AnimationSystem();
    manager.registerSystem(system);

    return system;
}
