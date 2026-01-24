export enum LogLevel {
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR',
	DEBUG = 'DEBUG'
}

/**
 * A structured logger that outputs JSON logs to the console.
 * Designed for server-side use.
 */
export class Logger {
	private context: string;

	/**
	 * Creates a new Logger instance.
	 *
	 * @param context - The context or module name where the logger is used (e.g., 'auth', 'db').
	 */
	constructor(context: string) {
		this.context = context;
	}

	private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
		const timestamp = new Date().toISOString();
		const logEntry = {
			timestamp,
			level,
			context: this.context,
			message,
			...meta
		};
		console.log(JSON.stringify(logEntry));
	}

	/**
	 * Logs an informational message.
	 *
	 * @param message - The message to log.
	 * @param meta - Optional metadata to include in the log entry.
	 */
	info(message: string, meta?: Record<string, unknown>) {
		this.log(LogLevel.INFO, message, meta);
	}

	/**
	 * Logs a warning message.
	 *
	 * @param message - The warning message to log.
	 * @param meta - Optional metadata to include in the log entry.
	 */
	warn(message: string, meta?: Record<string, unknown>) {
		this.log(LogLevel.WARN, message, meta);
	}

	/**
	 * Logs an error message.
	 * Automatically extracts the error message and stack trace if an Error object is provided.
	 *
	 * @param message - The error message to log.
	 * @param error - The error object or unknown error.
	 * @param meta - Optional metadata to include in the log entry.
	 */
	error(message: string, error?: unknown, meta?: Record<string, unknown>) {
		const errorMeta =
			error instanceof Error ? { error: error.message, stack: error.stack } : { error };
		this.log(LogLevel.ERROR, message, { ...meta, ...errorMeta });
	}

	/**
	 * Logs a debug message.
	 * Use this for detailed information useful for debugging.
	 *
	 * @param message - The debug message to log.
	 * @param meta - Optional metadata to include in the log entry.
	 */
	debug(message: string, meta?: Record<string, unknown>) {
		this.log(LogLevel.DEBUG, message, meta);
	}
}
