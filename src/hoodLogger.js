const os = require('os');

const { ErrorHoodLogger } = require('./errorHoodLogger');

const levels = {
    verbose: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
    10: 'verbose',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
};

// disconnect the logger
/** Class representing a HoodLogger. */
class HoodLogger {

	/**
	 * Creates an instance of HoodLogger.
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
            name: this._name, pid: process.pid, hostname: os.hostname(), v: (restOptions.version || 0).toString(),
        };

        this._logStream = restOptions.logStream || console.log;
        this._errStream = restOptions.errStream || console.error;

        if (trace) {
            trace.id = trace.id || getRandomStringId('yxxxxxxxxxxxxxxxxxx');
            trace.current = trace.current || getRandomStringId('yxxxxxxxxxxxxxxxxxx');
            this._trace = Object.assign({}, trace);
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
	 * @param {string} [options.minLevel] - Minimum log level.
	 * @param {object} [options.trace] - Object with parent and current traces. Using this param you can override traces from General logger.
	 * @param {number} [options.trace.id] - Root trace id.
	 * @param {number} [options.trace.current] - Current trace id.
	 * TODO: add tags
	 * @return {HoodLogger} new instance of Root trace logger.
	 */
    createRootTraceLogger(name, options) {
        let { minLevel, ...restOptions } = options || {};
        restOptions.minLevel = levels[minLevel] ? minLevel : this._minLevel;
        let newOptions = Object.assign({}, this._options, restOptions);
        newOptions.trace = newOptions.trace || {};
        return new HoodLogger(name, newOptions);
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
        let { minLevel, trace, ...restOptions } = options || {};
        restOptions.minLevel = levels[minLevel] ? minLevel : this._minLevel;
        let { current, ...restTrace } = this._trace;
        restTrace.parent = current;
        restOptions.trace = Object.assign({}, restTrace, trace);
        let newOptions = Object.assign({}, this._options, restOptions);
        return new HoodLogger(name, newOptions);
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
        writeLogWithLevel(this, msg, options, levels.verbose, this._logStream);
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
        writeLogWithLevel(this, msg, options, levels.debug, this._logStream);
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
        writeLogWithLevel(this, msg, options, levels.info, this._logStream);
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
        writeLogWithLevel(this, msg, options, levels.warn, this._logStream);
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
        writeLogWithLevel(this, msg, options, levels.error, this._errStream);
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
        writeLogWithLevel(this, msg, options, levels.fatal, this._errStream);
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
        writeLog(this, msg, options, levels.info, this._logStream);
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
        writeLog(this, msg, options, levels.info, this._logStream);
    }
}

const getRandomStringId = (strFormat) => {
    const timestamp = Date.now().toString();
    let index = timestamp.length;
    return strFormat.replace(/[xyd]/g, (c) => {
        if (c == 'd' && index > 0) {
            const retVal = timestamp[timestamp.length - index];
            index--
            return retVal;
        }
        return Math.floor(Math.random() * (c == 'x' ? 10 : 9));
    });
}

const writeLog = (logger, msg, options, level, stream) => {
    const { trace, tags, ...restOptions } = options || {};

    let log = {
        time: new Date(), level: level, msg: msg,
    };
    log = Object.assign({}, logger._defaultLog, log, restOptions);

    let traceObject = buildTraceObject(logger, trace, tags);
    if (traceObject) {
        log.trace = traceObject;
    }

    stream(JSON.stringify(log));
};

const writeLogWithLevel = (logger, msg, options, level, stream) => {
    if (level < levels[logger._minLevel]) {
        return;
    }

    writeLog(logger, msg, options, level, stream);
};

const buildTraceObject = (logger, trace, tags) => {
    if (logger._options && logger._options.disableTraceLogging) {
        return null;
    }

    let t = Object.assign({}, logger._trace, trace);
    let tTags = tags || t.tags;

    if (!Object.keys(t).length && !tTags) {
        return null;
    }

    if (!logger._trace || !logger._trace.id) {
        return null;
    }

    if (tTags) {
        t.tags = tTags;
    }
    return t;
};

module.exports = { HoodLogger };
