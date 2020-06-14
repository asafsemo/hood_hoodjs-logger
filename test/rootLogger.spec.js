const test = require('tape');

const { HoodLogger, ErrorHoodLogger } = require('../src/index');

test.onFinish(() => { process.exit(0); });

function setup() {
	const logger = new HoodLogger('general_logger_test', {
		logStream: jsonObj => { console.log(jsonObj); },
		errStream: jsonObj => { console.log(jsonObj); },
	});

	return { logger };
}

test('Test root logger without name, should throw an exception.', { skip: false }, assert => {
	try {
		const { logger } = setup();

		logger.createRootTraceLogger('', {});
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test root logger, should be created properly and log message.', { skip: false }, assert => {
	try {
		const { logger } = setup();

		const rootLogger = logger.createRootTraceLogger('root_logger_test', {});

		rootLogger.info('Testing root logger...');
		rootLogger.info('end', { status: 'complete' });

		assert.pass('Root logger was created successfully!');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});

test('Test root logger, successfully override trace ids(current and root).', { skip: false }, assert => {
	try {
		const { logger } = setup();

		const rootLogger = logger.createRootTraceLogger('root_logger_test', {
			trace: { id: 9999, current: 8888 }
		});

		rootLogger.info('Testing root logger...');
		rootLogger.info('end', { status: 'complete' });

		assert.pass('Root logger was created and tested successfully!');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});
