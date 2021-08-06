const os = require('os');
const { levels,
	writeLogWithLevel,
	getRandomStringId,
	getRandomHexStringId,
	buildTraceObject } = require('./functions');
const { ErrorHoodLogger } = require('./errorHoodLogger');

class BaseLogger {
	/**
	 * Creates an instance of BaseLogger.
	 *
	 * @constructor
	 * @param {string} name - Mandatory general logger name.
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {string} [options.minLevel=info] - Minimum logging level, e.g. debug, info etc..
	 * @param {string} [options.version="0"] - set the default version of the service
	 * @param {boolean} [options.disableTraceLogging=false] - Boolean flag, set it to true if you want to see logs in the files.
	 * @param {object} [options.trace] - Object which help tracing between several servers, connecting parent and current traces.
	 * @param {number} [options.trace.id] - Root trace id.
	 * @param {number} [options.trace.current] - Current trace id.
	 * TODO: add tags - last
	 */
	constructor(name, options) {
		if (!name) {
			throw new ErrorHoodLogger('Missing mandatory parameter: name');
		}
		const { minLevel, trace, ...restOptions } = options || {};

		this._name = name;
		this._minLevel = minLevel || 'info';
		this._options = restOptions;
		this._defaultLog = {
			name    : this._name,
			pid     : process.pid,
			hostname: os.hostname(),
			v       : (restOptions.version || 0).toString(),
		};

		if (trace) {
			// trace.id = trace.id || getRandomStringId('yxxxxxxxxxxxxxxxxxx');
			// trace.current = trace.current || getRandomStringId('yxxxxxxxxxxxxxxxxxx');
			trace.id = trace.id || getRandomHexStringId(32);
			trace.current = trace.current || getRandomHexStringId(16);
			this._trace = { ...trace };
			// this._trace.tags    = trace.tags;
		}
	}

	/**
	 * Log message in 'verbose' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @return {undefined}.
	 */
	verbose(msg, options) {
		writeLogWithLevel(this, msg, options, levels.verbose);
	}

	/**
	 * Log message in 'debug' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @return {undefined}.
	 */
	debug(msg, options) {
		writeLogWithLevel(this, msg, options, levels.debug);
	}

	/**
	 * Log message in 'info' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @param {string} [options.status] - Sets status of the logger, e.g. logger.info('end', { status: 'complete' });.
	 *                                    Currently used to terminate logging of the tracer.
	 * @return {undefined}.
	 */
	info(msg, options) {
		writeLogWithLevel(this, msg, options, levels.info);
	}

	/**
	 * Log message in 'warn' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @return {undefined}.
	 */
	warn(msg, options) {
		writeLogWithLevel(this, msg, options, levels.warn);
	}

	/**
	 * Log message in 'error' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @return {undefined}.
	 */
	error(msg, options) {
		writeLogWithLevel(this, msg, options, levels.error);
	}

	/**
	 * Log message in 'fatal' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @return {undefined}.
	 */
	fatal(msg, options) {
		writeLogWithLevel(this, msg, options, levels.fatal);
	}

	/**
	 * moreinfo - Log message in 'complete' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @return {undefined}.
	 */
	end(msg, options) {
		options = options || {};
		options.trace = options.trace || {};
		options.trace.status = 'end';
		this.writeLog(msg, options, levels.info);
	}

	/**
	 * moreinfo - Log message in 'end' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @return {undefined}.
	 */
	complete(msg, options) {
		options = options || {};
		options.trace = options.trace || {};
		options.trace.status = 'complete';
		this.writeLog(msg, options, levels.info);
	}

	/**
	 * Creates a Root logger instance. This is a helper function which can generate traces.
	 *
	 * @param {string} name - Mandatory root logger name.
	 * @param {object} [options={}] - Optional params.
	 * @param {string} [options.minLevel] - Minimum log level.
	 * @param {object} [options.trace] - Object with parent and current traces. Using this param you can override traces from General logger.
	 * @param {number} [options.trace.id] - Root trace id.
	 * @param {number} [options.trace.current] - Current trace id.
	 * TODO: add tags
	 * @return {HoodLogger} new instance of Root trace logger.
	 */
	createRootTraceLogger(name, options) {
		const { minLevel, ...restOptions } = options || {};
		restOptions.minLevel = levels[minLevel] ? minLevel : this._minLevel;
		const newOptions = { ...this._options, ...restOptions };
		newOptions.trace = newOptions.trace || {};
		return this.createChildClassLogger(name, newOptions);
	}

	/**
	 * Creates a Child logger instance. Child logger can be created only out of Root logger instance.
	 * Use this helper function to create a single 'span'.
	 * When you need to monitor some function behaviour you can create child tracer and wrap the function with it. e.g.:
	 *
	 * ```js
	 * let internalLogger = logger.createChildTraceLogger('findUserByEmail');
	 * internalLogger.info('start');
	 * let user = await userRepository.findUserByEmail(email);
	 * internalLogger.info('end', { status: 'complete' });
	 * ```
	 *
	 * @param {string} name - Mandatory child logger name.
	 * @param {object} [options={}] - Optional params.
	 * @param {string} [options.minLevel] - Minimum log level.
	 * @param {object} [options.trace] - Object with parent and current traces. Using this param you can override traces from General logger.
	 * @param {number} [options.trace.id] - Root trace id.
	 * @param {number} [options.trace.current] - Current trace id.
	 * TODO: add tags
	 * @return {HoodLogger} new instance of Child trace logger.
	 */
	createChildTraceLogger(name, options) {
		if (!this._trace) {
			throw new ErrorHoodLogger('Can\'t create child trace logger from global logger.');
		}
		const { minLevel, trace, ...restOptions } = options || {};
		restOptions.minLevel = levels[minLevel] ? minLevel : this._minLevel;
		const { current, ...restTrace } = this._trace;
		restTrace.parent = current;
		restOptions.trace = { ...restTrace, ...trace };
		const newOptions = { ...this._options, ...restOptions };
		return this.createChildClassLogger(name, newOptions);
	}

	createChildClassLogger(name, options) {
		throw new Error('Unimplemented subclass method: createChildClassLogger');
	}

	/**
	 * This is a helper function which creates object with trace headers:
	 *
	 * 'x-cloud-trace-context' - current trace id
	 * 'x-trace-parent-id' - parent trace id
	 *
	 * It can be helpful when tracing between several servers, getting parent and current traces.
	 *
	 * @return {TraceContext} .
	 */
	getTraceContext() {
		return {
			'x-cloud-trace-context': this._trace.id,
			'x-trace-parent-id'    : this._trace.current,
			...this._options.headers
		};
	}

	/**
	 * Use this function
	 *
	 * @return {number|null} Retrieves root trace id
	 */
	get rootTraceId() {
		if (!this._trace) {
			return null;
		}
		return this._trace.id;
	}

	/**
	 * @return {number|null} Retrieves current trace id
	 */
	get currentTraceId() {
		if (!this._trace) {
			return null;
		}
		return this._trace.current;
	}

	/**
	 * Set up listener on UncaughtException.
	 *
	 * @param {boolean} [isExitUncaughtException] Optical param, if to exit after UncaughtException was thrown.
	 * @return {undefined}
	 */
	// todo: test if this is working correct
	listenUncaughtException(isExitUncaughtException) {
		process.on('uncaughtException', (err) => {
			// log the error
			// this.error(err);
			if (!isExitUncaughtException) {
				return;
			}
			setTimeout(() => {
				process.exit(10);
			}, 5000);
		});
	}

	createDefaultLogObject(msg, options, level) {
		const { trace, tags, ...restOptions } = options || {};

		let log = {
			time: new Date(), level, msg,
		};
		log = { ...this._defaultLog, ...log, ...restOptions };

		const traceObject = buildTraceObject(this, trace, tags);
		if (traceObject) {
			log.trace = traceObject;
		}
		return log;
	}

	writeLog(msg, options, level) {
		throw new Error('Unimplemented subclass method: writeLog');
	}

	async flush() {
		throw new Error('Unimplemented subclass method: flush');
	}
}

module.exports = { BaseLogger };
