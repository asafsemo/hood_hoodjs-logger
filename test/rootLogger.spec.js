const test = require('tape');

const { HoodLogger, ErrorHoodLogger } = require('../src/index');

test.onFinish(() => { process.exit(0); });

let shouldSkip = true;

function setup(p) {
	const logger = new HoodLogger('general_logger_test', {
		logStream: jsonObj => { p.push(jsonObj); },
		errStream: jsonObj => { p.push(jsonObj); },
	});

	return { logger };
}

test('Test root logger without name, should throw an exception.', { skip: shouldSkip }, assert => {
	try {
		const { logger } = setup();

		logger.createRootTraceLogger('', {});
		assert.fail();
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test root logger, should be created properly and log message.', { skip: shouldSkip }, assert => {
	try {
		let p = [];
		const { logger } = setup(p);

		const rootLogger = logger.createRootTraceLogger('root_logger_test', {});

		rootLogger.info('Testing root logger...');
		rootLogger.debug('Testing root logger...');
		rootLogger.end('end');

		assert.equal(p.length, 2, 'Only 2 added to logs');
		assert.pass('Root logger was created successfully!');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});

test('Test root logger, successfully override trace ids(current and root).', { skip: shouldSkip }, assert => {
	try {
		let p = [];
		const { logger } = setup(p);

		const rootLogger = logger.createRootTraceLogger('root_logger_test', {
			trace: { id: 9999, current: 8888 }
		});

		rootLogger.info('Testing root logger...');
		rootLogger.debug('Testing root logger...');
		rootLogger.end('end');

		assert.equal(p.length, 2, 'Only 2 added to logs');

		assert.pass('Root logger was created and tested successfully!');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});
