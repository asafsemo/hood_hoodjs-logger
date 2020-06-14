const { ErrorHoodLogger } = require('./libs/errorHoodLogger');
const { HoodLogger } = require('./loggers/hoodLogger');
const { RemoteLogger } = require('./loggers/remoteLogger');

module.exports = {
	ErrorHoodLogger,
	HoodLogger,
	RemoteLogger,
};
