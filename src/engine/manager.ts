import System from "./systems/index";
import ComponentData from "./components/index";
import Logger from "./utils/logger";

type EntityComponents = Map<string, ComponentData>; // key: component name
type EntitiesMap = Map<Entity, EntityComponents>; // key: entity id

const log = new Logger("Manager");

const generateUuid = (): string => {
    return performance.now().toString(36).replace(".", "") + Math.random().toString(36).slice(-4);
}

export type Entity = string;

export class Query {
    private matchingEntities: EntitiesMap = new Map();
    private readonly components: string[];
    private readonly manager: Manager;

    constructor(components: string[], manager: Manager) {
        this.components = components;
        this.manager = manager;

        this.components.forEach(componentKey => {
            if (!manager.componentRegistered(componentKey)) log.fail(`component not registered: ${componentKey}`);
        });

        this.findAllMatching();
    }

    /**
     * Test if component names list matches the query
     */
    private match(components: EntityComponents): boolean {
        for (let i = 0; i < this.components.length; i++) {
            if (!components.has(this.components[i])) return false;
        }
        return true;
    }

    /**
     * Find all matching entities and save to matches
     * EXPENSIVE! Should only be called when creating a new query
     */
    public findAllMatching(): void {
        this.manager.getEntities().forEach((components: EntityComponents, entityId: string) => {
            if (this.match(components)) this.matchingEntities.set(entityId, components);
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
    private registeredComponents: Set<string> = new Set();
    private registeredSystems: Map<string, System> = new Map();
    private entities: EntitiesMap = new Map();
    private queries: Map<string, Query> = new Map();

    constructor() {
        log.new();
    }

    public registerComponent(key: string): void {
        if (this.registeredComponents.has(key)) {
            log.warning(`component key already exists: ${key}`);
            return;
        }
        this.registeredComponents.add(key);
        log.info(`registered component: ${key}`);
    }

    public registerSystem(key: string, system: System): void {
        if (this.registeredSystems.has(key)) {
            log.warning(`system key already exists: ${key}`);
            return;
        }

        this.registeredSystems.set(key, system);
        const queryKey = system.getComponents().join(" & ");
        if (!this.queries.has(queryKey)) {
            const query = new Query(system.getComponents(), this);
            this.queries.set(queryKey, query);
            log.info(`created query: ${queryKey}`);
        }
        const success = system.initialize(this.queries.get(queryKey), this);
        if (success) {
            log.info(`registered system: ${key}`);
        } else {
            log.error(`failed to start system: ${key}`);
        }
    }

    public getSystem(key: string): System {
        return this.registeredSystems.get(key);
    }

    public createEntity(): Entity {
        const uuid = generateUuid();
        this.entities.set(uuid, new Map());
        return uuid;
    }

    public setComponent(entity: Entity, componentKey: string, component: ComponentData): void {
        if (!this.componentRegistered(componentKey)) log.fail(`component not registered: ${componentKey}`);

        const entityComponents = this.getEntityComponents(entity);
        entityComponents.set(componentKey, component);

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

    public componentRegistered(componentKey: string): boolean {
        return this.registeredComponents.has(componentKey);
    }

    public tick(dt: number) {
        this.registeredSystems.forEach(system => system.tick(dt));
    }
}
