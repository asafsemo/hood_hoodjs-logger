// const uuidv4 = require('uuid/v4');
const bignum = require('bignum');
const os     = require('os');

const { ErrorTraceLogger } = require('./errorTraceLogger');

const levels = {
	trace: 10,
	debug: 20,
	info : 30,
	warn : 40,
	error: 50,
	fatal: 60,
	10   : 'trace',
	20   : 'debug',
	30   : 'info',
	40   : 'warn',
	50   : 'error',
	60   : 'fatal',
};

// disconnect the logger

class TraceLogger {

	constructor(name, min_level, trace, options) {
		if (!name) {
			throw new ErrorTraceLogger('Missing mandatory parameter: name');
		}
		this._name      = name || '';
		this._min_level = min_level || 'info';

		if (trace) {
			this._trace         = trace || {};
			this._trace.current = this._trace.current || bignum.rand(18446744073709551615).toNumber();
		}
		this._default_log = {
			name: name, pid: process.pid, hostname: os.hostname(), v: 0,
		};
		this._options     = options;

		// reorder fields structure

		// this.addSerializers({ err: Bunyan.stdSerializers.err });
	}

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

	get traceId() {
		if (!this._trace) {
			return null;
		}
		return this._trace.id;
	}

	get currentId() {
		if (!this._trace) {
			return null;
		}
		return this._trace.current;
	}

	createRootTraceLogger(name, min_level, trace, options) {
		name           = name || this._name;
		min_level      = levels[min_level] ? min_level : this._min_level;
		let restTrace  = Object.assign({}, trace);
		let newOptions = Object.assign({}, this._options, options);
		return new TraceLogger(name, min_level, restTrace, newOptions);
	}

	createChildTraceLogger(name, min_level, tags, options) {
		if (!this._trace) {
			throw new ErrorTraceLogger(`Cant create child trace logger from global logger`);
		}
		name                      = name || this._name;
		min_level                 = min_level || this._min_level;
		let { current, ...trace } = this._trace;
		trace.parent              = current;
		if (tags) {
			trace.tags = tags;
		}
		let newOptions = Object.assign({}, this._options, options);
		return new TraceLogger(name, min_level, trace, newOptions);
	}

	getHeaders() {
		return Object.assign({}, {
			'x-cloud-trace-context': this._trace.id, 'x-trace-parent-id': this._trace.current,
		}, this._options.headers);
	}

	trace(msg, obj, trace, tags) {
		write_log(this, msg, obj, trace, tags, levels.trace, console.log);
	}

	debug(msg, obj, trace, tags) {
		write_log(this, msg, obj, trace, tags, levels.debug, console.log);
	}

	info(msg, obj, trace, tags) {
		write_log(this, msg, obj, trace, tags, levels.info, console.log);
	}

	warn(msg, obj, trace, tags) {
		write_log(this, msg, obj, trace, tags, levels.warn, console.log);
	}

	error(msg, obj, trace, tags) {
		write_log(this, msg, obj, trace, tags, levels.error, console.error);
	}

	fatal(msg, obj, trace, tags) {
		write_log(this, msg, obj, trace, tags, levels.fatal, console.error);
	}
}

const write_log = (logger, msg, obj, trace, tags, level, stream) => {
	if (level < levels[logger._min_level]) {
		return;
	}

	let log = {
		time: new Date(), level: level, msg: msg,
	};
	log     = Object.assign({}, logger._default_log, log, obj);

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

TraceLogger.diProperties = { name: 'traceLogger', type: 'class', singleton: true };
TraceLogger.inject       = ['configLogger'];

module.exports = { TraceLogger };