import Logger from "./utils/logger";
import { Entity, EntityComponents, EntitiesMap } from "./model";
import Manager from "./manager";

const log = new Logger("Query");

export default class Query {
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
}
