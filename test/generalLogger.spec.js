const test = require('tape');

const { HoodLogger, ErrorHoodLogger } = require('../src/index');

test.onFinish(() => { process.exit(0); });

test('Test general logger without name, should throw an exception.', { skip: false }, assert => {
	try {
		const logger = new HoodLogger();
		logger.info('test');
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test general logger with name, should pass.', { skip: false }, assert => {
	try {
		const logger = new HoodLogger('tester', {
			logStream: (jsonObj) => { console.log(jsonObj); },
			errStream: (jsonObj) => { console.log(jsonObj); },
		});
		logger.info('test');
		assert.pass('HoodLogger instance created successfully.');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});
