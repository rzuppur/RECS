# RECS
Minimal entity component system for 2D game development in JS/TS

*Example game based on RECS ([Video link](https://reinozuppur.com/screens/space.mp4))*
![Space](https://reinozuppur.com/screens/space.jpg "")

```ts
import { Engine, Entity } from "@rzuppur/recs";

const elementToMountTo = "#app"; // default: body, pointer events break if page is scrolled
const engine = new Engine(elementToMountTo);
const manager = engine.manager;

/* Register custom components (see below) */
manager.registerComponent(new Component());

/* Register custom systems (see below) */
manager.registerSystem(new System());

/* Create entities, returns id */
const entity: Entity = manager.createEntity();

/* Add entity components */
manager.setComponent(entity, new Component({ data }));
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
        // Add custom initialization code here if needed
        return super.start(query, manager);
    }

    public tick(dt: number /* ms since last tick */): void {
        for (const [entity, components] of this.query.getMatching()) {
            const p = Query.getComponent(components, PointableComponent);
            if (p.data.clicked) {
                console.log("clicked", entity);
            }
        }
    }
}
```

## Built in components
https://github.com/rzuppur/recs/tree/main/src/lib/components

## Built in systems
https://github.com/rzuppur/recs/tree/main/src/lib/systems
