class ErrorTraceLogger extends Error {

	constructor(message, errorCode = 0) {
		super(message);
		this.name       = 'ErrorTraceLogger';
		this._errorCode = errorCode;
	}

	get errorCode() {
		return this._errorCode;
	}

}

module.exports = { ErrorTraceLogger };
