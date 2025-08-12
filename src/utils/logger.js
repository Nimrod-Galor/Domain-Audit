// Lightweight shared logger for core modules
// Uses winston when available; falls back to console methods

import winston from 'winston';

const level = process.env.LOG_LEVEL || 'info';

let logger;
try {
  logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        return `${timestamp} [${level}] ${message}${stack ? `\n${stack}` : ''}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        format: process.env.NODE_ENV === 'production'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ level, message }) => `${level}: ${message}`)
            )
      })
    ]
  });
} catch (_) {
  // Fallback minimal logger
  logger = {
    debug: (...args) => console.debug(...args),
    info: (...args) => console.info(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args)
  };
}

export default logger;
