import type Manager from "../manager";
import Query from "../query";

export default abstract class System {
    protected query: Query;

    public readonly componentsQueryKey: string;
    public readonly name: string;
    public started: boolean = false;

    /**
     * System name can be used later to get access to the system from manager.
     * Component names list is sorted - used to create query keys.
     */
    protected constructor(name: string, componentsQuery: string[]) {
        this.name = name;
        this.componentsQueryKey = Query.getComponentsQuery(componentsQuery);
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
