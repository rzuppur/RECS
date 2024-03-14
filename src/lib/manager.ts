import type System from "./systems/index";
import type Component from "./components";
import { LoggerFactory, Logger } from "./utils/logger";
import type { EntitiesArray, EntityComponents } from "./model";
import type { Entity } from "./model";
import Query from "./query";
import Vector2 from "./utils/vector2";

const debugNumberFormat = Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const debugTicksCount = 300;
const debugTimePercentageBarLength = 8;

export default class Manager {
    private nextEntityId = 0;
    private components: Map<string, Component> = new Map();
    private systems: Map<string, System> = new Map();
    private systemsOrdered: Array<System> = [];
    private entities: EntitiesArray = [];
    private queries: Map<string, Query> = new Map();
    private log: Logger;
    private debug: boolean;
    private totalTicks: number = 0;
    private totalTicksTime: number = 0;
    private totalTicksTimeBySystem: Map<string, number> = new Map();
    private firstTickTime: number;

    constructor(debug = false) {
        this.log = LoggerFactory.getLogger("Manager");
        this.log.new();
        this.debug = debug;
    }

    public registerComponent(component: Component): void {
        if (this.components.has(component.name)) {
            this.log.warning(`Component already exists: ${component.name}`);
            return;
        }
        this.components.set(component.name, component);
        this.log.debug(`Registered component: ${component.name}`);
    }

    public registerQuery(queryKey: string): Query {
        if (!this.queries.has(queryKey)) {
            this.queries.set(queryKey, new Query(queryKey, this));
            this.log.debug(`Created query: ${queryKey}`);
        }
        return this.queries.get(queryKey);
    }

    public registerSystem(system: System): void {
        this.log.debug(`Registering system: ${system.name}`);
        if (this.systems.has(system.name)) {
            this.log.warning(`System already exists: ${system.name}`);
            return;
        }
        this.systems.set(system.name, system);
        const query = this.registerQuery(system.componentsQueryKey);

        if (system.beforeStart) {
            if (system.beforeStart(this)) {
                setTimeout(() => {
                    if (system.start(query, this)) {
                        this.log.debug(`Started system: ${system.name}`);
                    } else {
                        this.log.error(`Failed to start system: ${system.name}`);
                    }
                });
            } else {
                this.log.error(`Failed to start system [beforeStart]: ${system.name}`);
            }
        } else {
            if (system.start(query, this)) {
                this.log.debug(`Started system: ${system.name}`);
            } else {
                this.log.error(`Failed to start system: ${system.name}`);
            }
        }

        const displaySystem = this.systems.get("Display");
        if (displaySystem) {
            const systemsWithoutDisplay = [...this.systems].filter(([_, system]) => system.name !== "Display").map(([_, system]) => system);
            this.systemsOrdered = [...systemsWithoutDisplay, displaySystem];
        } else {
            this.systemsOrdered = [...this.systems].map(([_, system]) => system);
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
        this.entities[this.nextEntityId] = new Map();
        return this.nextEntityId++;
    }

    public deleteEntity(entity: Entity): void {
        const components: EntityComponents = this.entities[entity];
        if (components) [...components.values()].forEach((component) => component.beforeDestroy());
        delete this.entities[entity];
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
        const queriesNeedToBeUpdated = !entityComponents.has(component.name);
        entityComponents.set(component.name, component);

        if (queriesNeedToBeUpdated) this.queries.forEach(query => query.setEntityIfMatches(entityComponents, entity));
    }

    public removeComponent(entity: Entity, componentKey: string): void {
        if (!this.componentKeyRegistered(componentKey)) {
            this.log.fail(`[removeComponent] component not registered: ${componentKey}`);
        }

        const entityComponents = this.getEntityComponents(entity);
        entityComponents.get(componentKey)?.beforeDestroy();

        if (entityComponents.delete(componentKey)) {
            this.queries.forEach(query => query.setEntityIfMatches(entityComponents, entity));
        }
    }

    public getEntityComponents(entity: Entity): EntityComponents {
        const entityComponents = this.entities[entity];
        if (!entityComponents) this.log.fail(`entity does not exist: ${entity}`);
        return entityComponents;
    }

    public getEntities(): EntitiesArray {
        return this.entities;
    }

    public tick(dt: number) {
        if (this.debug) {
            const tickStart = performance.now();
            if (!this.firstTickTime) this.firstTickTime = tickStart;

            const systems = this.systemsOrdered.filter((system) => system.started);
            for (const system of systems) {
                const start = performance.now();
                system.tick(dt, this);
                const time = performance.now() - start;
                if (this.totalTicksTimeBySystem.has(system.name)) {
                    this.totalTicksTimeBySystem.set(system.name, this.totalTicksTimeBySystem.get(system.name) + time);
                } else {
                    this.totalTicksTimeBySystem.set(system.name, time);
                }
            }

            const tickEnd = performance.now();
            this.totalTicksTime += tickEnd - tickStart;
            this.totalTicks += 1;

            if (this.totalTicks > debugTicksCount) {
                const FPS = 1000 / ((tickEnd - this.firstTickTime) / debugTicksCount);
                let percentages = `Average: ${debugNumberFormat.format(FPS)} FPS, ${debugNumberFormat.format(this.totalTicksTime / debugTicksCount)}ms per tick, usage by system:`;
                let totalAllocatedTime = [...this.totalTicksTimeBySystem.values()].reduce((t, c) => t + c, 0);
                this.totalTicksTimeBySystem.set("UNKNOWN", this.totalTicksTime - totalAllocatedTime);

                this.totalTicksTimeBySystem.forEach((time, system) => {
                    const percentage = time / this.totalTicksTime;
                    const barLength = Math.round(percentage * debugTimePercentageBarLength);
                    percentages += `\n[${"#".repeat(barLength)}${"_".repeat(debugTimePercentageBarLength - barLength)}] ${system} ${debugNumberFormat.format(percentage * 100)}%`;
                });
                this.log.debug(percentages);

                this.totalTicks = 0;
                this.totalTicksTime = 0;
                this.totalTicksTimeBySystem = new Map();
                this.firstTickTime = 0;

                this.log.debug(`Vector2 free ${Vector2.getPoolSize()} / ${Vector2.getPoolSizeTotal()} total`);
            }
        } else {
            const systems = this.systemsOrdered.filter((system) => system.started);
            for (const system of systems) {
                system.tick(dt, this);
            }
        }
    }
}
