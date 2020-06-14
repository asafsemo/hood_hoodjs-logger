const { BaseLogger } = require('../libs/baseLogger');

// disconnect the logger
/** Class representing a HoodLogger. */
class HoodLogger extends BaseLogger {
	constructor(name, options) {
		super(name, options);
		this._logStream = this._options.logStream || console.log;
		this._errStream = this._options.errStream || console.error;
	}

	writeLog(msg, options, level) {
		const log = this.createDefaultLogObject(msg, options, level);

		let stream = this._logStream;
		const errorStreamLevels = ['error', 'warn', 'fatal'];
		if (errorStreamLevels.contains(level)) {
			stream = this._errStream;
		}

		stream(JSON.stringify(log));
	}
}

module.exports = { HoodLogger };
