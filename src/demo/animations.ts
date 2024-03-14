import { Component, DrawableComponent, Manager, Query, System, Vector2, WorldLocationComponent, InterpolatedValue } from "../lib";
import type { ComponentData, Entity, InterpolateType } from "../lib";

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

const range = 70;

export class AnimationSystem extends System {
    private demoEntities: Map<Entity, InterpolatedValue> = new Map();

    constructor() {
        super("Animation", [AnimationComponent.key]);
    }

    public start(query: Query, manager: Manager): boolean {
        const title = manager.createEntity();
        manager.setComponent(title, new WorldLocationComponent({ loc: Vector2.new(-range / 2, -40) }));
        manager.setComponent(title, new DrawableComponent({
            drawables: [
                { type: "TEXT", size: 8, fontWeight: 700, color: "#fff", content: "INTERPOLATION", offset: Vector2.new(0, -10) },
            ],
        }))

        let y = -40;
        [
            "NEAREST",
            "EASE_IN_CUBIC",
            "EASE_IN",
            "LINEAR",
            "EASE",
            "EASE_IN_OUT",
            "EASE_OUT",
            "EASE_OUT_CUBIC",
        ].forEach((type: InterpolateType) => {
            const background = manager.createEntity();
            manager.setComponent(background, new WorldLocationComponent({ loc: Vector2.new(-range / 2, y) }));
            manager.setComponent(background, new DrawableComponent({
                drawables: [
                    { type: "RECT", width: range + 5, height: 5, strokeColor: "#666" },
                    { type: "TEXT", size: 4, color: "#fff", content: type },
                ],
            }));

            const entity = manager.createEntity();
            manager.setComponent(entity, new AnimationComponent({ id: type }));
            manager.setComponent(entity, new WorldLocationComponent({ loc: Vector2.new(-range / 2, y) }));
            manager.setComponent(entity, new DrawableComponent({
                drawables: [
                    { type: "RECT", width: 5, height: 5, color: "#fff" },
                ],
            }));
            y += 15;

            const ease = new InterpolatedValue(-range / 2, type);
            ease.setInterpolate(range / 2);
            ease.onComplete = () => {
                setTimeout(() => ease.setInterpolate(-ease.value), 500);
            };

            this.demoEntities.set(entity, ease);
        });

        return super.start(query, manager);
    }

    public tick(): void {
        for (const [entity, components] of this.query.getMatching()) {
            const ease = this.demoEntities.get(entity);
            const { data: location } = Query.getComponent(components, WorldLocationComponent);
            location.loc.free();
            location.loc = Vector2.new(ease.get(), location.loc.y);
            const { data: drawable } = Query.getComponent(components, DrawableComponent);
            drawable.drawables[0].color = ease.easing ? "#ff0" : "#fff";
        }
    }
}

export function initializeAnimations(manager: Manager): AnimationSystem {
    manager.registerComponent(new AnimationComponent());

    const system = new AnimationSystem();
    manager.registerSystem(system);

    return system;
}
