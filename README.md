# RECS
Minimal entity component system for 2D game development in JS/TS

```ts
import { Engine, Entity } from "@rzuppur/recs";

const engine = new Engine();
const manager = engine.manager;

/* Register custom component names */
manager.registerComponent(
  key: string,
)

/* Register custom systems (see below) */
manager.registerSystem(
  system: System,
)

/* Create entities, returns UUID string */
const entity: Entity = this.manager.createEntity()

/* Add entity components */
manager.setComponent(
  entity: string,
  componentKey: string,
  data: {},
)
```

## Creating a custom system
```ts
import { System, PointableData } from "@rzuppur/recs";

/**
 * Components used by the system.
 * Used for the query to find all entities the system needs to run on. Entity must have all the components listed to qualify.
 */
const components = ["pointable"];

class MySystem extends System {
    constructor() {
        super("My", components);
    }

    public initialize(query: Query): boolean {
        // Add custom initialization code here IF needed

        super.initialize(query);
        return true;
    }

    public tick(dt: number /* ms since last tick */): void {
        this.query.getMatching().forEach((components, entity) => {
            const p = components.get("pointable") as PointableData;
            if (p.clicked) {
                console.log("clicked", entity);
            }
        });
    }
}
```

## Built in components
https://github.com/rzuppur/recs/tree/main/src/engine/components

## Built in systems
https://github.com/rzuppur/recs/tree/main/src/engine/systems
