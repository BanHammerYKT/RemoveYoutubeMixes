// Logger class
export class Logger {
  static ENABLED: boolean;
  static VERBOSE: boolean;
  static TAG: string;

  // Logs debug message if enabled and verbose.
  static debug(...args: any[]) {
    if (Logger.VERBOSE) Logger.info(...args);
  }

  // Logs information message if enabled.
  static info(...args: any[]) {
    if (Logger.ENABLED) console.log(Logger.TAG, ...args);
  }

  // Logs warning message if enabled.
  static warning(...args: any[]) {
    if (Logger.ENABLED) console.warn(Logger.TAG, ...args);
  }

  // Logs error message if enabled.
  static error(...args: any[]) {
    if (Logger.ENABLED) console.error(Logger.TAG, ...args);
  }
}

Logger.TAG = "RemoveYoutubeMixes:";
Logger.ENABLED = false;
Logger.VERBOSE = false;
