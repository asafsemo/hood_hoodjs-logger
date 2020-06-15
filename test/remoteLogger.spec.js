const test = require('tape');

const { RemoteLogger, ErrorHoodLogger } = require('../src/index');

test.onFinish(() => { process.exit(0); });

let shouldSkip = true;

test('Test general logger without name, should throw an exception.', { skip: shouldSkip }, assert => {
	try {
		const logger = new RemoteLogger();
		assert.fail();
		logger.info('test');
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test general logger without name, should throw an exception.', { skip: shouldSkip }, assert => {
	try {
		const logger = new RemoteLogger('');
		assert.fail();
		logger.info('test');
	} catch (err) {
		assert.ok(err instanceof ErrorHoodLogger, `Thrown error should be instance of: ${ErrorHoodLogger.name}`);
		assert.equal(err.message, 'Missing mandatory parameter: name', 'Error message should be: Missing mandatory parameter: name');
	} finally {
		assert.end();
	}
});

test('Test general logger with name, should pass.', { skip: shouldSkip }, async (assert) => {
	try {
		let httpClientWrapper = {
			flushed: false,
			post: function (url, data, options) {
				this.url = url;
				this.data = data;
				this.options = options;
				this.flushed = true;
			}
		};
		let url = 'testUrl';
		let options = 'testOptions';
		const logger = new RemoteLogger('tester', httpClientWrapper, { url, options });
		logger.info('info');
		logger.error('error');
		logger.debug('debug');
		await logger.flush();

		assert.equal(httpClientWrapper.url, url, 'validate url');
		assert.equal(httpClientWrapper.data.length, 2, 'validate data');
		assert.equal(httpClientWrapper.options, options, 'validate options');
		assert.equal(httpClientWrapper.flushed, true, 'validate flushed');
		assert.pass('HoodLogger instance created successfully.');
	} catch (err) {
		assert.fail(err);
	} finally {
		assert.end();
	}
});
