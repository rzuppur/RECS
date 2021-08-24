import System from "./systems/index";
import Component from "./components";
import { generateUuid } from "./utils/uuid";
import Logger from "./utils/logger";
import { Entity, EntityComponents, EntitiesMap } from "./model";
import Query from "./query";

const log = new Logger("Manager");

export default class Manager {
    private components: Map<string, Component> = new Map();
    private systems: Map<string, System> = new Map();
    private entities: EntitiesMap = new Map();
    private queries: Map<string, Query> = new Map();

    constructor() {
        log.new();
    }

    public registerComponent(component: Component): void {
        if (this.components.has(component.name)) {
            log.warning(`component already exists: ${component.name}`);
            return;
        }
        this.components.set(component.name, component);
        log.info(`registered component: ${component.name}`);
    }

    public registerSystem(system: System): void {
        log.info(`registering system: ${system.name}`);
        if (this.systems.has(system.name)) {
            log.warning(`system already exists: ${system.name}`);
            return;
        }
        this.systems.set(system.name, system);

        const queryKey = system.getComponentsQueryKey();
        if (!this.queries.has(queryKey)) {
            this.queries.set(queryKey, new Query(queryKey, this));
            log.info(`created query: ${queryKey}`);
        }

        if (system.beforeStart(this)) {
            setTimeout(() => {
                if (system.start(this.queries.get(queryKey), this)) {
                    log.info(`started system: ${system.name}`);
                } else {
                    log.error(`failed to start system: ${system.name}`);
                }
            });
        } else {
            log.error(`failed to start system [beforeStart]: ${system.name}`);
        }
    }

    public getSystem(key: string): System {
        const system = this.systems.get(key);
        if (!system) {
            log.error(`System not registered: ${key}`);
        }
        return system;
    }

    public createEntity(): Entity {
        const uuid = generateUuid();
        this.entities.set(uuid, new Map());
        return uuid;
    }

    public componentRegistered(component: Component): boolean {
        return this.components.has(component.name);
    }

    public componentKeyRegistered(componentName: string): boolean {
        return this.components.has(componentName);
    }

    public setComponent(entity: Entity, component: Component): void {
        if (!this.componentRegistered(component)) {
            log.fail(`[setComponent] component not registered: ${component.name}`);
        }

        const entityComponents = this.getEntityComponents(entity);
        entityComponents.set(component.name, component);

        this.queries.forEach(query => query.setEntityIfMatches(entityComponents, entity));
    }

    public removeComponent(entity: Entity, componentKey: string): void {
        if (!this.componentKeyRegistered(componentKey)) {
            log.fail(`[removeComponent] component not registered: ${componentKey}`);
        }

        const entityComponents = this.getEntityComponents(entity);
        if (entityComponents.delete(componentKey)) {
            this.queries.forEach(query => query.setEntityIfMatches(entityComponents, entity));
        }
    }

    public getEntityComponents(entity: Entity): EntityComponents {
        const entityComponents = this.entities.get(entity);
        if (!entityComponents) log.fail(`entity does not exist: ${entity}`);
        return entityComponents;
    }

    public getEntities(): EntitiesMap {
        return this.entities;
    }

    public tick(dt: number) {
        this.systems.forEach(system => system.started && system.tick(dt, this));
    }
}
