export enum LOG_LEVEL {
    ERROR,
    WARNING,
    INFO,
    DEBUG,
}

export class LoggerFactory {
    private static level: LOG_LEVEL = LOG_LEVEL.ERROR;

    private constructor() {
    }

    public static setLevel(level: LOG_LEVEL) {
        this.level = level;
    }

    public static getLogger(name: string): Logger {
        return new Logger(name, this.level)
    }
}

export class Logger {
    protected name: string;
    protected level: LOG_LEVEL;

    constructor(name: string, level: LOG_LEVEL) {
        this.name = name;
        this.level = level;
    }

    new(message: string = "") {
        if (this.level >= LOG_LEVEL.DEBUG) console.info(`%c✦ %c${this.name}%c${message}`, "color: #50c040;", "font-weight: bold; color: #fff; background: #484; padding: 3px 5px;", "padding: 3px 5px;");
    }

    debug(message: string) {
        if (this.level >= LOG_LEVEL.DEBUG) console.info(`%c🝔 %c${this.name}%c${message}`, "color: #777;", "color: #ddd; background: #444; padding: 3px 5px; font-weight: bold;;", "color: #555; background: #ddd; padding: 3px 5px;");
    }

    info(message: string) {
        if (this.level >= LOG_LEVEL.INFO) console.info(`%c🛈 %c${this.name}%c${message}`, "color: #40a0f0;", "color: #fff; background: #37b; padding: 3px 5px; font-weight: bold;", "color: #222; background: #fff; padding: 3px 5px;");
    }

    warning(message: string) {
        if (this.level >= LOG_LEVEL.WARNING) console.warn(`%c⚠ %c${this.name}%c${message}`, "color: #e0a000;", "color: #000; background: #ea3; padding: 3px 5px; font-weight: bold;", "padding: 3px 5px;");
    }

    error(message: string) {
        if (this.level >= LOG_LEVEL.ERROR) console.error(`%c◈ %c${this.name}%c${message}`, "color: #e01000;", "color: #fff; background: #b33; padding: 3px 5px; font-weight: bold;", "padding: 3px 5px;");
    }

    fail(message: string) {
        this.error(message);
        throw new Error(`${this.name} - ${message}`);
    }
}
