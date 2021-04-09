import System from "./systems/index";
import Component from "./components";
import {generateUuid} from "./utils/uuid";
import Logger from "./utils/logger";

type EntityComponents = Map<string, Component>; // key: component name
type EntitiesMap = Map<Entity, EntityComponents>; // key: entity id

const log = new Logger("Manager");

export type Entity = string;

export class Query {
    private matchingEntities: EntitiesMap = new Map();
    private readonly componentKeys: string[];
    private readonly manager: Manager;

    constructor(queryKey: string, manager: Manager) {
        this.componentKeys = queryKey.split(" & ");
        this.manager = manager;

        this.componentKeys.filter(key => key).forEach(componentKey => {
            if (!manager.componentKeyRegistered(componentKey)) {
                log.fail(`[query] component not registered: ${componentKey}`);
            }
        });

        this.findAllMatching();
    }

    /**
     * Test if component names list matches the query
     */
    private match(components: EntityComponents): boolean {
        for (let i = 0; i < this.componentKeys.length; i++) {
            if (!components.has(this.componentKeys[i])) return false;
        }
        return true;
    }

    /**
     * Find all matching entities and save to matches
     * EXPENSIVE! Should only be called when creating a new query
     */
    public findAllMatching(): void {
        this.manager.getEntities().forEach((components: EntityComponents, entity: Entity) => {
            if (this.match(components)) {
                this.matchingEntities.set(entity, components);
            }
        });
    }

    /**
     * Called by Manager when new components are added to entity
     */
    public setEntityIfMatches(components: EntityComponents, entity: Entity): void {
        if (this.match(components)) this.matchingEntities.set(entity, components);
    }

    /**
     * Return all matching entities map with components
     */
    public getMatching(): EntitiesMap {
        return this.matchingEntities;
    }
}

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
        const success = system.initialize(this.queries.get(queryKey), this);
        if (success) {
            log.info(`registered system: ${system.name}`);
        } else {
            log.error(`failed to start system: ${system.name}`);
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
            log.fail(`component not registered: ${component.name}`);
        }

        const entityComponents = this.getEntityComponents(entity);
        entityComponents.set(component.name, component);

        this.queries.forEach(query => query.setEntityIfMatches(entityComponents, entity));
    }

    public removeComponent(entity: Entity, componentKey: string): void {
        console.warn("removeComponent: not implemented");
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
        this.systems.forEach(system => system.tick(dt));
    }
}
