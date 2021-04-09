type ComponentData = {
    [x: string]: number | string | boolean;
};

export default abstract class Component {
    public readonly name: string;
    public data: ComponentData;

    protected constructor(name: string, data: ComponentData = {}) {
        this.name = name;
        this.data = data;
    }
}

export {
    ComponentData,
}
