import Manager from "../manager";
import Query from "../query";
import Component from "../components";

export default abstract class System {
    protected query: Query;
    protected readonly componentsQuery: string[];

    public readonly name: string;
    public started: boolean = false;

    /**
     * System name can be used later to get access to the system from manager.
     * Component names list is sorted - used to create query keys.
     */
    protected constructor(name: string, componentsQuery: string[]) {
        this.name = name;

        componentsQuery.sort();
        this.componentsQuery = componentsQuery;
    }

    public getComponentsQueryKey(): string {
        return this.componentsQuery.join(" & ");
    }

    /**
     * Called by manager.ts -> registerSystem
     *
     * Returns boolean indicating success
     */
    public beforeStart(manager: Manager): boolean {
        return true;
    }

    /**
     * Called by manager.ts -> registerSystem
     *
     * Returns boolean indicating success
     */
    public start(query: Query, manager: Manager): boolean {
        this.query = query;
        this.started = true;
        return true;
    }

    public tick(dt: number, manager: Manager): void {
    }
}
