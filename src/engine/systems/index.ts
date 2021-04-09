import Manager, {Query} from "../manager";

export default abstract class System {
    protected query: Query;
    protected readonly componentsQuery: string[];

    public readonly name: string;

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
    public initialize(query: Query, manager: Manager): boolean {
        this.query = query;
        return true;
    }

    public tick(dt: number): void {}
}
