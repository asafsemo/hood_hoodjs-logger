const bignum = require('bignum');
const os     = require('os');

const { ErrorTraceLogger } = require('./errorTraceLogger');

const levels = {
	verbose: 10,
	debug  : 20,
	info   : 30,
	warn   : 40,
	error  : 50,
	fatal  : 60,
	10     : 'verbose',
	20     : 'debug',
	30     : 'info',
	40     : 'warn',
	50     : 'error',
	60     : 'fatal',
};

// disconnect the logger
/** Class representing a TraceLogger. */
class TraceLogger {

  /**
   * Creates an instance of TraceLogger.
   *
   * @constructor
   * @param {string} name - Mandatory general logger name.
   * @param {object} [options={}] - The string containing two comma-separated numbers.
   * @param {string} [options.min_level=info] - Minimum logging level, e.g. debug, info etc..
   * @param {boolean} [options.disable_trace_logging=false] - Boolean flag, set it to true if you want to see logs in the files.
   * @param {object} [options.trace] - Object which help tracing between several servers, connecting parent and current traces.
   * @param {number} [options.trace.id] - Root trace id.
   * @param {number} [options.trace.current] - Current trace id.
   * TODO: add tags - last
   */
  constructor (name, options) {
    if (!name) {
      throw new ErrorTraceLogger('Missing mandatory parameter: name');
    }
    const { min_level, trace, ...restOptions } = options || {};

    this._name        = name;
    this._min_level   = min_level || 'info';
    this._options     = restOptions;
		this._default_log = {
			name    : this._name,
			pid     : process.pid,
			hostname: os.hostname(),
			v       : 0,
		};

		this._logStream = restOptions.logStream || console.log;
		this._errStream = restOptions.errStream || console.error;

		if (trace) {
			this._trace.id      = trace.id || bignum.rand(18446744073709551615).toNumber();
			this._trace.current = trace.current || bignum.rand(18446744073709551615).toNumber();
			// this._trace.tags    = trace.tags;
		}
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
	 * Creates a Root logger instance. This is a helper function which can generate traces.
   *
   * @param {string} name - Mandatory root logger name.
	 * @param {object} [options={}] - Optional params.
	 * @param {string} [options.min_level] - Minimum log level.
	 * @param {object} [options.trace] - Object with parent and current traces. Using this param you can override traces from General logger.
	 * @param {number} [options.trace.id] - Root trace id.
	 * @param {number} [options.trace.current] - Current trace id.
	 * TODO: add tags
	 * @return {TraceLogger} new instance of Root trace logger.
	 */
	createRootTraceLogger(name, options) {
		let { min_level, ...restOptions } = options || {};
		restOptions.min_level             = levels[min_level] ? min_level : this._min_level;
		let newOptions                    = Object.assign({}, this._options, restOptions);
		newOptions.trace                  = newOptions.trace || {};
		return new TraceLogger(name, newOptions);
	}

	/**
	 * Creates a Child logger instance. Child logger can be created only out of Root logger instance.
	 * Use this helper function to create a single 'span'.
	 * When you need to monitor some function behaviour you can create child tracer and wrap the function with it. e.g.:
	 *
	 * ```js
	 * let internalLogger = logger.createChildTraceLogger('getUserByEmailAndPassword');
	 * internalLogger.info('start');
	 * let user = await userRepository.findUserByEmail(email);
	 * internalLogger.info('end', { status: 'end' });
	 * ```
	 *
	 * @param {string} name - Mandatory child logger name.
	 * @param {object} [options={}] - Optional params.
	 * @param {string} [options.min_level] - Minimum log level.
	 * @param {object} [options.trace] - Object with parent and current traces. Using this param you can override traces from General logger.
	 * @param {number} [options.trace.id] - Root trace id.
	 * @param {number} [options.trace.current] - Current trace id.
	 * TODO: add tags
	 * @return {TraceLogger} new instance of Child trace logger.
	 */
	createChildTraceLogger (name, options) {
		if (!this._trace) {
			throw new ErrorTraceLogger('Can\'t create child trace logger from global logger.');
		}
		let { min_level, trace, ...restOptions } = options || {};
		restOptions.min_level                    = levels[min_level] ? min_level : this._min_level;
		let { current, ...restTrace }            = this._trace;
		restTrace.parent                         = current;
		restOptions.trace                        = Object.assign({}, restTrace, trace);
		let newOptions                           = Object.assign({}, this._options, restOptions);
		return new TraceLogger(name, newOptions);
	}

	/**
	 * @typedef {object} TraceContext
	 * @property {number} x-cloud-trace-context header containing current trace id
	 * @property {number} x-trace-parent-id header containing parent trace id
	 *
	 * */

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
		return Object.assign({}, {
			'x-cloud-trace-context': this._trace.id, 'x-trace-parent-id': this._trace.current,
		}, this._options.headers);
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
		write_log(this, msg, options, levels.verbose, this._logStream);
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
		write_log(this, msg, options, levels.debug, this._logStream);
	}

	/**
	 * Log message in 'info' log level to console.
	 *
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - Optional log params.
	 * @param {object} [options.trace=null] - trace data(current and parent). Use this option to override trace from logger.
	 * @param {object} [options.tags=null] - tags options.
	 * @return {undefined}.
	 */
	info(msg, options) {
		write_log(this, msg, options, levels.info, this._logStream);
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
		write_log(this, msg, options, levels.warn, this._logStream);
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
		write_log(this, msg, options, levels.error, this._errStream);
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
		write_log(this, msg, options, levels.fatal, this._errStream);
	}
}

const write_log = (logger, msg, options, level, stream) => {
	if (level < levels[logger._min_level]) {
		return;
	}

	const { trace, tags, ...restOptions } = options || {};

	let log = {
		time: new Date(), level: level, msg: msg,
	};
	log     = Object.assign({}, logger._default_log, log, restOptions);

	let trace_object = build_trace_object(logger, trace, tags);
	if (trace_object) {
		log.trace = trace_object;
	}

	stream(JSON.stringify(log));
};

const build_trace_object = (logger, trace, tags) => {
	if (logger._options && logger._options.disable_trace_logging) {
		return null;
	}

	let t      = Object.assign({}, logger._trace, trace);
	let t_tags = tags || t.tags;

	if (!Object.keys(t).length && !t_tags) {
		return null;
	}

	if (!logger._trace || !logger._trace.id) {
		return null;
	}

	if (t_tags) {
		t.tags = t_tags;
	}
	return t;
};

module.exports = { TraceLogger };
