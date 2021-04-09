import Manager, {Query} from "../manager";

export default abstract class System {
    protected query: Query;
    protected readonly components: string[];

    public readonly name: string;

    /**
     * System name can be used later to get access to the system from manager.
     * Component names list is sorted - used to create query keys.
     */
    protected constructor(name: string, components: string[]) {
        this.name = name;

        components.sort();
        this.components = components;
    }

    public getComponents(): string[] {
        return this.components;
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
