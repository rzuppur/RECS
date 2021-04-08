import Manager, {Query} from "../manager";

export default abstract class System {
    protected query: Query;
    protected readonly components: string[];

    /**
     * Component names list is sorted - used to create query keys.
     */
    protected constructor(components: string[]) {
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
