import {Query} from "../manager.js";

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
     */
    public initialize(query: Query): boolean {
        this.query = query;
        return true;
    }

    public tick(dt: number): void {}
}
