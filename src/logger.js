// Logger class
export class Logger {
    // Logs debug message if enabled and verbose.
    static debug(...args) {
        if (Logger.VERBOSE) Logger.info(Logger.TAG, ...args);
    }

    // Logs information message if enabled.
    static info(...args) {
        if (Logger.ENABLED) console.log(Logger.TAG, ...args);
    }

    // Logs warning message if enabled.
    static warning(...args) {
        if (Logger.ENABLED) console.warn(Logger.TAG, ...args);
    }

    // Logs error message if enabled.
    static error(...args) {
        if (Logger.ENABLED) console.error(Logger.TAG, ...args);
    }
}

Logger.TAG = "RemoveYoutubeMixes";
Logger.ENABLED = false;
Logger.VERBOSE = false;
