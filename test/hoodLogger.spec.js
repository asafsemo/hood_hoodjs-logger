const test = require('tape');

const { HoodLogger, ErrorHoodLogger } = require('../src/index');

test.onFinish(() => { process.exit(0); });

let shouldSkip = true;

test('Test general logger without name, should throw an exception.', { skip: shouldSkip }, assert => {
	try {
		const logger = new HoodLogger();
		assert.fail();
		logger.info('test');
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test general logger with empty name, should throw an exception.', { skip: shouldSkip }, assert => {
	try {
		const logger = new HoodLogger('');
		assert.fail();
		logger.info('test');
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test general logger with name, should pass.', { skip: shouldSkip }, assert => {
	try {
		const logger = new HoodLogger('tester', {
			logStream: (jsonObj) => { console.log(jsonObj); },
			errStream: (jsonObj) => { console.log(jsonObj); },
		});
		logger.info('info');
		logger.error('error');
		logger.debug('debug');
		assert.pass('HoodLogger instance created successfully.');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});

test('Test general logger with name, should pass.', { skip: shouldSkip }, assert => {
	try {
		let p = [];
		const logger = new HoodLogger('tester', {
			logStream: (jsonObj) => { p.push(jsonObj); },
			errStream: (jsonObj) => { p.push(jsonObj); },
		});
		logger.info('info');
		logger.error('error');
		logger.debug('debug');
		assert.equal(p.length, 2, 'Only 2 should be added to array');
		assert.pass('HoodLogger instance created successfully.');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});
