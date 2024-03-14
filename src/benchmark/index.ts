import type { ComponentData } from "../lib";
import * as recs from "../lib";

/**
 * COMMON
 */

function time(label: string, func: () => void): void {
    label = label.padEnd(24, " ");
    console.time(label);
    func();
    console.timeEnd(label);
}

async function timeAsync(label: string, func: () => Promise<void>): Promise<void> {
    label = label.padEnd(24, " ");
    console.time(label);
    await func();
    console.timeEnd(label);
}

/**
 * GRAVITY
 */

interface GravityComponentData extends ComponentData {
    mass: number; // kg
    vel: recs.Vector2; // m/s
}

class GravityComponent extends recs.Component {
    static key = "GravityComponent";
    declare public data: GravityComponentData;

    constructor(data?: GravityComponentData) {
        super(GravityComponent.key, data);
    }
}

const runForTicks = 60;
let gravityTicks = 0;

class GravitySystem extends recs.System {
    onTickLimitReached: (value?: any) => void;

    constructor() {
        super("GravitySystem", [recs.WorldLocationComponent.key, GravityComponent.key]);
    }

    public tick(dt: number): void {
        const stepsPerTick = 1;
        const timeScale = 0.016667 / stepsPerTick;

        const allBodies = this.query.getMatching();

        for (let i = 0; i < stepsPerTick; i++) {
            for (const [bodyEntity, components] of allBodies) {

                // Get current body components
                const { data: bodyPhysicsData } = recs.Query.getComponent(components, GravityComponent);
                const { data: bodyLocationData } = recs.Query.getComponent(components, recs.WorldLocationComponent);
                const bodyLocation = bodyLocationData.loc;

                // Loop over all other bodies
                for (const [otherBodyEntity, otherComponents] of allBodies) {
                    if (bodyEntity === otherBodyEntity) continue;

                    // Get other body components
                    const { data: { loc: otherLocation } } = recs.Query.getComponent(otherComponents, recs.WorldLocationComponent);
                    const { data: { mass: otherMass, soiRadius: otherSoiRadius, radius: otherRadius } } = recs.Query.getComponent(otherComponents, GravityComponent);
                    const diff = otherLocation.subtract(bodyLocation);

                    // Calculate force
                    const distance = diff.len;
                    const angle = diff.angle;
                    const force = 6.6743e-11 * otherMass / (distance * distance);

                    // Add acceleration to velocity
                    const acceleration = new recs.Vector2(force * Math.cos(angle), force * Math.sin(angle));
                    bodyPhysicsData.vel = bodyPhysicsData.vel.add(acceleration.multiply(timeScale));
                }

                // Apply velocity
                bodyLocationData.loc = bodyLocationData.loc.add(bodyPhysicsData.vel.multiply(timeScale));
            }
        }

        if (++gravityTicks >= runForTicks) {
            this.onTickLimitReached();
        }
    }
}

document.getElementById("test1").onclick = async (event) => {
    document.querySelectorAll("button").forEach(b => b.disabled = true);

    let engine: recs.Engine;
    let manager: recs.Manager;
    let gravitySystem: GravitySystem;

    time("init", () => {
        engine = new recs.Engine("#game", false);
        manager = engine.manager
    });

    time("registerComponent", () => {
        manager.registerComponent(new GravityComponent());
    });

    time("registerSystem", () => {
        gravitySystem = new GravitySystem();
        manager.registerSystem(gravitySystem);
    });

    const gap = 5;
    const count = 1024;
    const side = ~~Math.sqrt(count);
    const start = (-side / 2 * gap);
    time(`create ${count} bodies`, () => {
        for (let i = 0; i < count; i++) {
            const entity = manager.createEntity();
            manager.setComponent(entity, new recs.WorldLocationComponent({
                loc: new recs.Vector2(
                    start + (i % side) * gap,
                    start + ~~(i / side) * gap,
                ),
            }));
            manager.setComponent(entity, new GravityComponent({ mass: 1_000_000_000_000, vel: new recs.Vector2(0, 0) }));
            manager.setComponent(entity, new recs.DrawableComponent({
                drawables: [
                    { type: "ELLIPSE", width: 1, height: 1, color: "#fff" },
                ],
            }));
        }
    });

    await timeAsync(`run for ${runForTicks} ticks`, async () => {
        engine.start();
        await new Promise((resolve) => {
            gravitySystem.onTickLimitReached = resolve;
        });
        engine.stop();
    });
}
