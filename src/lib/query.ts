import { LoggerFactory, Logger } from "./utils/logger";
import { EntitiesMap, Entity, EntityComponents } from "./model";
import Manager from "./manager";
import Component from "./components";

export default class Query {
    private matchingEntities: EntitiesMap = new Map();
    private readonly componentKeys: string[];
    private readonly manager: Manager;
    private log: Logger;

    constructor(queryKey: string, manager: Manager) {
        this.log = LoggerFactory.getLogger("Engine");
        this.componentKeys = queryKey.split(" & ");
        this.manager = manager;

        this.componentKeys.filter(key => key).forEach(componentKey => {
            if (!manager.componentKeyRegistered(componentKey)) {
                this.log.fail(`[query] component not registered: ${componentKey}`);
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
     * Called by Manager when new components are added or removed from entity
     */
    public setEntityIfMatches(components: EntityComponents, entity: Entity): void {
        if (this.match(components)) {
            this.matchingEntities.set(entity, components);
        } else {
            this.matchingEntities.delete(entity);
        }
    }

    /**
     * Return all matching entities map with components
     */
    public getMatching(): EntitiesMap {
        return this.matchingEntities;
    }

    public deleteMatch(entity: Entity): boolean {
        return this.matchingEntities.delete(entity);
    }

    /**
     * @param components - All components returned from this.getMatching()
     * @param component - Component constructor, name used for finding the component & type is returned.
     */
    public static getComponent<T extends Component>(components: EntityComponents, component: new (...args: any) => T): T {
        const componentConstructor = component as unknown as typeof Component;
        return components.get(componentConstructor.key) as T;
    }

    public static getComponentsQuery(componentsQuery: string[]): string {
        componentsQuery.sort();
        return componentsQuery.join(" & ");
    }
}
