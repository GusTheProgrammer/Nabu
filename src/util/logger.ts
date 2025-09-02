enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

const CURRENT_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production'
    ? LogLevel.ERROR
    : LogLevel.DEBUG;

export default class Logger {
    static debug(message: string, ...args: Parameters<typeof console.debug>): void {
        if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }

    static info(message: string, ...args: Parameters<typeof console.info>): void {
        if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }

    static warn(message: string, ...args: Parameters<typeof console.warn>): void {
        if (CURRENT_LOG_LEVEL <= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    static error(message: string, ...args: Parameters<typeof console.error>): void {
        if (CURRENT_LOG_LEVEL <= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }
}