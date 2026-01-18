export enum LogLevel {
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR',
	DEBUG = 'DEBUG'
}

export class Logger {
	private context: string;

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

	info(message: string, meta?: Record<string, unknown>) {
		this.log(LogLevel.INFO, message, meta);
	}

	warn(message: string, meta?: Record<string, unknown>) {
		this.log(LogLevel.WARN, message, meta);
	}

	error(message: string, error?: unknown, meta?: Record<string, unknown>) {
		const errorMeta = error instanceof Error ? { error: error.message, stack: error.stack } : { error };
		this.log(LogLevel.ERROR, message, { ...meta, ...errorMeta });
	}

	debug(message: string, meta?: Record<string, unknown>) {
		this.log(LogLevel.DEBUG, message, meta);
	}
}
