const test = require('tape');

const { HoodLogger, ErrorHoodLogger } = require('../src/index');

test.onFinish(() => { process.exit(0); });

function setup(p) {
	const logger = new HoodLogger('general_logger_test', {
		logStream: jsonObj => { p.push(jsonObj); },
		errStream: jsonObj => { p.push(jsonObj); },
	});

	const rootLogger = logger.createRootTraceLogger('root_logger_test', {});

	return { logger, rootLogger };
}

let shouldSkip = true;

test('Test child logger without name, should throw an exception.', { skip: shouldSkip }, assert => {
	try {
		let p = [];
		const { logger } = setup(p);

		logger.createChildTraceLogger();
		assert.fail();
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Can\'t create child trace logger from global logger.', 'Error message should be: Can\'t create child trace logger from global logger.');
	} finally {
		assert.end();
	}
});

test('Test child logger without name, should throw an exception.', { skip: shouldSkip }, assert => {
	try {
		let p = [];
		const { rootLogger } = setup(p);

		rootLogger.createChildTraceLogger();
		assert.fail();
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test child logger, should be created properly and log message.', { skip: shouldSkip }, assert => {
	try {
		let p = [];
		const { rootLogger } = setup(p);

		const internalLogger = rootLogger.createChildTraceLogger('child_test_logger');

		internalLogger.info('Testing child logger...');
		internalLogger.complete('complete');

		console.log(p);

		assert.pass('Child logger was created successfully!');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});

test('Test child logger, successfully override trace ids(current and root).', { skip: shouldSkip }, assert => {
	try {
		let p = [];
		const { rootLogger } = setup(p);

		const internalLogger = rootLogger.createChildTraceLogger('child_test_logger', {
			trace: { id: 1234, current: 4321 }
		});

		internalLogger.info('Testing child logger...');
		internalLogger.end('end');

		console.log(p);

		assert.pass('Child logger was created and tested successfully!');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});
