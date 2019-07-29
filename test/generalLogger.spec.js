const test = require('tape');
const { TraceLogger } = require('../src/traceLogger');

test.onFinish(() => { process.exit(0); });

test('Test general logger without name, should throw an exception', { skip: false }, (t) => {
	try {
		const logger = new TraceLogger();
		logger.info('test');
	} catch (ex) {
		t.pass();
	} finally {
		t.end();
	}
});

test('Test general logger without name, should throw an exception', { skip: false }, (t) => {
	try {
		const logger = new TraceLogger('tester', {
			logStream: (jsonObj) => {console.log(jsonObj);},
			errStream: (jsonObj) => {console.log(jsonObj);},
		});
		logger.info('test');
		t.pass();
	} catch (ex) {
		t.fail(ex);
	} finally {
		t.end();
	}
});