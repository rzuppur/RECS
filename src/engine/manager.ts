import System from "./systems/index";
import Component from "./components";
import { generateUuid } from "./utils/uuid";
import { LoggerFactory, Logger } from "./utils/logger";
import { EntitiesMap, Entity, EntityComponents } from "./model";
import Query from "./query";

export default class Manager {
    private components: Map<string, Component> = new Map();
    private systems: Map<string, System> = new Map();
    private entities: EntitiesMap = new Map();
    private queries: Map<string, Query> = new Map();
    private log: Logger;
    private debug: boolean;
    private tickTotal: number = 0;
    private tickTotalBySystem: Map<string, number> = new Map();
    private ticksCollected: number = 0;

    constructor(debug = false) {
        this.log = LoggerFactory.getLogger("Manager");
        this.log.new();
        this.debug = debug;
    }

    public registerComponent(component: Component): void {
        if (this.components.has(component.name)) {
            this.log.warning(`component already exists: ${component.name}`);
            return;
        }
        this.components.set(component.name, component);
        this.log.debug(`registered component: ${component.name}`);
    }

    public registerQuery(queryKey: string): Query {
        if (!this.queries.has(queryKey)) {
            this.queries.set(queryKey, new Query(queryKey, this));
            this.log.debug(`created query: ${queryKey}`);
        }
        return this.queries.get(queryKey);
    }

    public registerSystem(system: System): void {
        this.log.debug(`registering system: ${system.name}`);
        if (this.systems.has(system.name)) {
            this.log.warning(`system already exists: ${system.name}`);
            return;
        }
        this.systems.set(system.name, system);
        const query = this.registerQuery(system.componentsQueryKey);

        if (system.beforeStart(this)) {
            setTimeout(() => {
                if (system.start(query, this)) {
                    this.log.debug(`started system: ${system.name}`);
                } else {
                    this.log.error(`failed to start system: ${system.name}`);
                }
            });
        } else {
            this.log.error(`failed to start system [beforeStart]: ${system.name}`);
        }
    }

    public getSystem(key: string): System {
        const system = this.systems.get(key);
        if (!system) {
            this.log.error(`System not registered: ${key}`);
        }
        return system;
    }

    public systemKeyRegistered(systemName: string): boolean {
        return this.systems.has(systemName);
    }

    public createEntity(): Entity {
        const uuid = generateUuid();
        this.entities.set(uuid, new Map());
        return uuid;
    }

    public deleteEntity(entity: Entity): void {
        this.entities.delete(entity);
        this.queries.forEach(query => query.deleteMatch(entity));
    }

    public componentRegistered(component: Component): boolean {
        return this.components.has(component.name);
    }

    public componentKeyRegistered(componentName: string): boolean {
        return this.components.has(componentName);
    }

    public setComponent(entity: Entity, component: Component): void {
        if (!this.componentRegistered(component)) {
            this.log.fail(`[setComponent] component not registered: ${component.name}`);
        }

        const entityComponents = this.getEntityComponents(entity);
        entityComponents.set(component.name, component);

        this.queries.forEach(query => query.setEntityIfMatches(entityComponents, entity));
    }

    public removeComponent(entity: Entity, componentKey: string): void {
        if (!this.componentKeyRegistered(componentKey)) {
            this.log.fail(`[removeComponent] component not registered: ${componentKey}`);
        }

        const entityComponents = this.getEntityComponents(entity);
        if (entityComponents.delete(componentKey)) {
            this.queries.forEach(query => query.setEntityIfMatches(entityComponents, entity));
        }
    }

    public getEntityComponents(entity: Entity): EntityComponents {
        const entityComponents = this.entities.get(entity);
        if (!entityComponents) this.log.fail(`entity does not exist: ${entity}`);
        return entityComponents;
    }

    public getEntities(): EntitiesMap {
        return this.entities;
    }

    public tick(dt: number) {
        if (this.debug) {
            const tickStart = performance.now();

            const systemsWithoutDisplay = [...this.systems].filter(([_, system]) => system.started && system.name !== "Display").map(([_, system]) => system);
            const systemsOrdered = [...systemsWithoutDisplay, this.systems.get("Display")];
            systemsOrdered.forEach((s: System) => {
                const start = performance.now();
                s.tick(dt, this);
                const time = performance.now() - start;
                if (this.tickTotalBySystem.has(s.name)) {
                    this.tickTotalBySystem.set(s.name, this.tickTotalBySystem.get(s.name) + time);
                } else {
                    this.tickTotalBySystem.set(s.name, time);
                }
            });

            this.tickTotal += performance.now() - tickStart;
            this.ticksCollected += 1;

            if (this.ticksCollected > 60*5) {
                let percentages = "Engine tick time usage by system";
                let totalAllocatedTime = 0;
                this.tickTotalBySystem.forEach((time, system) => {
                    percentages += `\n${system} ${Math.round((time / this.tickTotal) * 100)}%`;
                    totalAllocatedTime += time;
                });
                percentages += `\nUNKNOWN ${Math.round(((this.tickTotal - totalAllocatedTime) / this.tickTotal) * 100)}%`;

                this.log.debug(percentages);
                this.ticksCollected = 0;
                this.tickTotal = 0;
                this.tickTotalBySystem = new Map();
            }
        } else {
            const systemsWithoutDisplay = [...this.systems].filter(([_, system]) => system.started && system.name !== "Display").map(([_, system]) => system);
            const systemsOrdered = [...systemsWithoutDisplay, this.systems.get("Display")];
            systemsOrdered.forEach((s: System) => {
                s.tick(dt, this);
            });
        }
    }
}
