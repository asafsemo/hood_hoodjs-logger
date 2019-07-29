// const uuidv4 = require('uuid/v4');
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
	 * Create a point.
	 * @param {number} x - The x value.
	 * @param {number} y - The y value.
	 * min_level
	 * disable_trace_logging
	 * trace
	 * logStream - for tests
	 * errStream - for tests
	 * tags - last
	 */
	constructor(name, options) {
		if (!name) {
			throw new ErrorTraceLogger('Missing mandatory parameter: name');
		}
		const { min_level, trace, ...restOptions } = options || {};

		this._name        = name;
		this._min_level   = min_level || 'info';
		this._options     = options;
		this._default_log = {
			name: name, pid: process.pid, hostname: os.hostname(), v: 0,
		};

		this._logStream = options.logStream || console.log;
		this._errStream = options.errStream || console.error;

		if (trace) {
			this._trace.id      = trace.id || bignum.rand(18446744073709551615).toNumber();
			this._trace.current = trace.current || bignum.rand(18446744073709551615).toNumber();
			// this._trace.tags    = trace.tags;
		}
	}

	/**
	 * Get the x value.
	 * @return {number} The x value.
	 */
	// todo: test if this is working correct
	listenUncaughtException(isExitUncaughtException) {
		let self = this;
		process.on('uncaughtException', function(err) {
			// log the error
			// self.error(err);
			if (!isExitUncaughtException) {
				return;
			}
			setTimeout(() => {
				process.exit(10);
			}, 5000);
		});
	}

	/**
	 * Represents a book.
	 * @constructor
	 * @param {string} title - The title of the book.
	 * @param {string} author - The author of the book.
	 */
	get rootTraceId() {
		if (!this._trace) {
			return null;
		}
		return this._trace.id;
	}

	/**
	 * Represents a book.
	 * @constructor
	 * @param {string} title - The title of the book.
	 * @param {string} author - The author of the book.
	 */
	get currentTraceId() {
		if (!this._trace) {
			return null;
		}
		return this._trace.current;
	}

	/**
	 * Represents a book.
	 * @constructor
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {string} options.min_level - Information about the user.
	 * trace.id
	 * trace.current
	 * tags
	 */
	// todo: review
	createRootTraceLogger(name, options) {
		let { min_level, ...restOptions } = options || {};
		restOptions.min_level             = levels[min_level] ? min_level : this._min_level;
		let newOptions                    = Object.assign({}, this._options, restOptions);
		newOptions.trace                  = newOptions.trace || {};
		return new TraceLogger(name, newOptions);
	}

	/**
	 * Represents a book.
	 * @constructor
	 * @param {string} title - The title of the book.
	 * @param {string} author - The author of the book.
	 * min_level
	 * tags
	 * trace
	 */
	// todo: review
	createChildTraceLogger(name, options) {
		if (!this._trace) {
			throw new ErrorTraceLogger(`Cant create child trace logger from global logger`);
		}
		let { min_level, trace, ...restOptions } = options || {};
		restOptions.min_level                    = levels[min_level] ? min_level : this._min_level;
		let { current, ...restTrace }            = this._trace;
		restTrace.parent                         = current;
		const newTrace                           = Object.assign({}, restTrace, trace);
		restOptions.trace                        = newTrace;
		let newOptions                           = Object.assign({}, this._options, restOptions);
		return new TraceLogger(name, newOptions);
	}

	/**
	 * Log message in Fatal log level to console.error
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {object} [options.trace=null] - Information about the user.
	 * @param {object} [options.tags=null] - Information about the user.
	 * @return {undefined}.
	 */
	getTraceContext() {
		return Object.assign({}, {
			'x-cloud-trace-context': this._trace.id, 'x-trace-parent-id': this._trace.current,
		}, this._options.headers);
	}

	/**
	 * Log message in Fatal log level to console.error
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {object} [options.trace=null] - Information about the user.
	 * @param {object} [options.tags=null] - Information about the user.
	 * @return {undefined}.
	 */
	verbose(msg, options) {
		write_log(this, msg, options, levels.verbose, this._logStream);
	}

	/**
	 * Log message in Fatal log level to console.error
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {object} [options.trace=null] - Information about the user.
	 * @param {object} [options.tags=null] - Information about the user.
	 * @return {undefined}.
	 */
	debug(msg, options) {
		write_log(this, msg, options, levels.debug, this._logStream);
	}

	/**
	 * Log message in Fatal log level to console.error
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {object} [options.trace=null] - Information about the user.
	 * @param {object} [options.tags=null] - Information about the user.
	 * @return {undefined}.
	 */
	info(msg, options) {
		write_log(this, msg, options, levels.info, this._logStream);
	}

	/**
	 * Log message in Fatal log level to console.error
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {object} [options.trace=null] - Information about the user.
	 * @param {object} [options.tags=null] - Information about the user.
	 * @return {undefined}.
	 */
	warn(msg, options) {
		write_log(this, msg, options, levels.warn, this._logStream);
	}

	/**
	 * Log message in Fatal log level to console.error
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {object} [options.trace=null] - Information about the user.
	 * @param {object} [options.tags=null] - Information about the user.
	 * @return {undefined}.
	 */
	error(msg, options) {
		write_log(this, msg, options, levels.error, this._errStream);
	}

	/**
	 * Log message in Fatal log level to console.error
	 * @param {string} msg - The log message to print to the console.
	 * @param {object} [options={}] - The string containing two comma-separated numbers.
	 * @param {object} [options.trace=null] - Information about the user.
	 * @param {object} [options.tags=null] - Information about the user.
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