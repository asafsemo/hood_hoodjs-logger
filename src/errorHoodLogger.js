class ErrorHoodLogger extends Error {

	constructor(message, errorCode = 0) {
		super(message);
		this.name       = 'HoodLogger';
		this._errorCode = errorCode;
	}

	get errorCode() {
		return this._errorCode;
	}

}

module.exports = { ErrorHoodLogger };
