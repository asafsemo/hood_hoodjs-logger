const { BaseLogger } = require('../libs/baseLogger');

class RemoteLogger extends BaseLogger {
	constructor(name, options) {
		super(name, options);
		consts.logs = [];
	}

	writeLog(msg, options, level) {
		const log = this.createDefaultLogObject(msg, options, level);
		this.logs.push(log);
	}

	flush() {
		console.log('1111111');
	}
}

module.exports = { RemoteLogger };
