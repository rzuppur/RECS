# RECS
Minimal entity component system for 2D game development in JS/TS

```ts
import { Engine, Entity } from "@rzuppur/recs";

const elementToMountTo = "#app"; // default: body, pointer events break if page is scrolled
const engine = new Engine(elementToMountTo);
const manager = engine.manager;

/* Register custom components (see below) */
manager.registerComponent(new Component())

/* Register custom systems (see below) */
manager.registerSystem(new System())

/* Create entities, returns UUID string */
const entity: Entity = this.manager.createEntity()

/* Add entity components */
manager.setComponent(
  entity: Entity,
  component: new Component({
    data,
  }),
)
```

## Creating a custom component
```ts
import { Component, ComponentData } from "@rzuppur/recs";

interface MyData extends ComponentData {
    value: number;
}

class MyComponent extends Component {
    static key = "My";
    public data: MyData;

    constructor(data?: MyData) {
        super(MyComponent.key, data);
    }
}
```

## Creating a custom system
```ts
import { System, Query, PointableComponent } from "@rzuppur/recs";

const name = "My";
const componentsQuery = [PointableComponent.key];

class MySystem extends System {
    constructor() {
        super(name, componentsQuery);
    }

    public start(query: Query, manager: Manager): boolean {
        // Add custom initialization code here IF needed
        return super.start(query, manager);
    }

    public tick(dt: number /* ms since last tick */): void {
        this.query.getMatching().forEach((components, entity) => {
            const p = Query.getComponent(components, PointableComponent);
            if (p.data.clicked) {
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
