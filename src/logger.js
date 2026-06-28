export const LogLevel = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

class Logger {
  constructor(level = LogLevel.INFO) {
    this.level = level;
    this.logs = [];
    this.maxLogs = 100;
  }

  setLevel(level) {
    this.level = level;
  }

  shouldLog(level) {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.level);
  }

  log(level, message, context, error) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const output = error
      ? `[${level}] ${message}: ${error.message}`
      : `[${level}] ${message}`;

    if (level === LogLevel.ERROR) {
      console.error(output);
    } else if (level === LogLevel.WARN) {
      console.warn(output);
    } else {
      console.log(output);
    }

    if (context && this.level === LogLevel.DEBUG) {
      console.log("Context:", context);
    }
  }

  error(message, context, error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message, context) {
    this.log(LogLevel.WARN, message, context);
  }

  info(message, context) {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message, context) {
    this.log(LogLevel.DEBUG, message, context);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();

export function setLogLevel(level) {
  logger.setLevel(level);
}
