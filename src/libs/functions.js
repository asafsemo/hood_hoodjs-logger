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

const writeLogWithLevel = (logger, msg, options, level) => {
	if (level < levels[logger._minLevel]) {
		return;
	}

	logger.writeLog(msg, options, level);
};

const getRandomStringId = (strFormat) => {
	const timestamp = Date.now().toString();
	let index = timestamp.length;
	return strFormat.replace(/[xyd]/g, (c) => {
		if (c == 'd' && index > 0) {
			const retVal = timestamp[timestamp.length - index];
			index--;
			return retVal;
		}
		return Math.floor(Math.random() * (c == 'x' ? 10 : 9));
	});
};

const getRandomHexStringId = (strlen) => {
	return '0x' + [...Array(strlen)].map(() => { return Math.floor(Math.random() * 16).toString(16)}).join('');
}

const buildTraceObject = (logger, trace, tags) => {
	if (logger._options && logger._options.disableTraceLogging) {
		return null;
	}

	const t = { ...logger._trace, ...trace };
	const tTags = tags || t.tags;

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

module.exports = {
	levels,
	writeLogWithLevel,
	getRandomStringId,
	getRandomHexStringId,
	buildTraceObject,
};
