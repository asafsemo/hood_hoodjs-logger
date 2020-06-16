const { BaseLogger } = require('../libs/baseLogger');

class RemoteLogger extends BaseLogger {
	constructor(name, httpClientWrapper, httpClientConfig, options) {
		super(name, options);
		options = options || {};
		this._parentLogger = options.parentLogger;
		if (!this._parentLogger) {
			this._logs = [];
			this._parentLogger = this;
			this._flushCounter = 0;
			this._maxFlushCounter = options.maxFlushCounter || 10;
			this._maxPayloadSize = options.maxPayloadSize || 100000;
			this._currentPayloadSize = 0;
		}
		this._httpClientWrapper = httpClientWrapper;
		this._httpClientConfig = httpClientConfig;
	}

	createChildClassLogger(name, options) {
		options = options || {};
		options.parentLogger = this._parentLogger;
		return new RemoteLogger(name, null, null, options);
	}

	writeLog(msg, options, level) {
		const log = this.createDefaultLogObject(msg, options, level);
		this._parentLogger._logs.push(log);
		this._parentLogger._currentPayloadSize += JSON.stringify(log).length;
		if (this._parentLogger._currentPayloadSize >= this._parentLogger._maxPayloadSize) {
			this._parentLogger.flush();
		}
	}

	async flush() {
		let process = false;
		this._flushCounter++;
		process = (this._flushCounter >= this._maxFlushCounter);
		process = process || (this._currentPayloadSize >= this._maxPayloadSize);
		if (!process) {
			return;
		}
		this._flushCounter = 0;
		const payload = JSON.stringify(this._logs);
		this._currentPayloadSize = 0;
		this._logs = [];

		const { url, options } = this._httpClientConfig;
		return this._httpClientWrapper.post(url, payload, options);
	}
}

module.exports = { RemoteLogger };
