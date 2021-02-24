export default class Logger {
    module: string;

    constructor(module: string) {
        this.module = module;
    }

    new(message: string = "") {
        console.info(`%c⫸ %c[${this.module}]%c ${message}`, "color: #50c040;", "font-weight: bold; color: #40a030;", "");
    }

    info(message: string) {
        console.info(`%c◉ %c[${this.module}]%c ${message}`, "color: #40a0f0;", "font-weight: bold; opacity: 0.7;", "");
    }

    warning(message: string) {
        console.warn(`%c◈ %c[${this.module}]%c ${message}`, "color: #e0a000;", "font-weight: bold; opacity: 0.7;", "");
    }

    error(message: string) {
        console.error(`%c◈ %c[${this.module}]%c ${message}`, "color: #e01000;", "font-weight: bold;", "");
    }

    fail(message: string) {
        this.error(message);
        throw new Error(`${this.module} - ${message}`);
    }
}