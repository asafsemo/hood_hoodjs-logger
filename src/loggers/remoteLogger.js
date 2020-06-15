const { BaseLogger } = require('../libs/baseLogger');

class RemoteLogger extends BaseLogger {
	constructor(name, httpClientWrapper, httpClientConfig, options) {
		super(name, options);
		this._logs = [];
		this._httpClientWrapper = httpClientWrapper;
		this._httpClientConfig = httpClientConfig;
	}

	createChildClassLogger(name, options) {
		return new RemoteLogger(name, options);
	}

	writeLog(msg, options, level) {
		const log = this.createDefaultLogObject(msg, options, level);
		this._logs.push(log);
	}

	async flush() {
		const { url, options } = this._httpClientConfig;
		this._httpClientWrapper.post(url, this._logs, options);
	}
}

module.exports = { RemoteLogger };
