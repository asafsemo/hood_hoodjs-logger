const test = require('tape');

const { HoodLogger, ErrorHoodLogger } = require('../src/index');

test.onFinish(() => { process.exit(0); });

function setup() {
	const logger = new HoodLogger('general_logger_test', {
		logStream: jsonObj => { console.log(jsonObj); },
		errStream: jsonObj => { console.log(jsonObj); },
	});

	const rootLogger = logger.createRootTraceLogger('root_logger_test', {});

	return { logger, rootLogger };
}

test('Test child logger without name, should throw an exception.', { skip: false }, assert => {
	try {
		const { logger } = setup();

		logger.createChildTraceLogger();
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Can\'t create child trace logger from global logger.', 'Error message should be: Can\'t create child trace logger from global logger.');
	} finally {
		assert.end();
	}
});

test('Test child logger without name, should throw an exception.', { skip: false }, assert => {
	try {
		const { rootLogger } = setup();

		rootLogger.createChildTraceLogger();
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test child logger, should be created properly and log message.', { skip: false }, assert => {
	try {
		const { rootLogger } = setup();

		const internalLogger = rootLogger.createChildTraceLogger('child_test_logger');

		internalLogger.info('Testing child logger...');
		internalLogger.info('end', { status: 'complete' });

		assert.pass('Child logger was created successfully!');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});

test('Test child logger, successfully override trace ids(current and root).', { skip: false }, assert => {
	try {
		const { rootLogger } = setup();

		const internalLogger = rootLogger.createChildTraceLogger('child_test_logger', {
			trace: { id: 1234, current: 4321 }
		});

		internalLogger.info('Testing child logger...');
		internalLogger.info('end', { status: 'complete' });

		assert.pass('Child logger was created and tested successfully!');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});
