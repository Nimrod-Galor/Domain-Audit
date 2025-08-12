/**
 * Jest environment setup
 * Sets NODE_ENV to 'test' for all test runs
 */

process.env.NODE_ENV = 'test';
// Provide global test constants expected by test-infrastructure.test.js
global.TEST_CONSTANTS = {
	SAMPLE_URLS: {
		VALID: 'https://example.com',
		INVALID: 'not-a-url',
		NOT_FOUND: 'https://example.com/404'
	},
	TIMEOUTS: {
		UNIT: 5000,
		INTEGRATION: 30000,
		E2E: 60000
	}
};

// Default log level for tests (suppress noise unless a test overrides)
if (!process.env.LOG_LEVEL) {
	process.env.LOG_LEVEL = 'error';
}
// Provide other env vars used in assertions if unset
if (!process.env.AUDIT_TIMEOUT) process.env.AUDIT_TIMEOUT = '10000';
if (!process.env.MAX_CONCURRENT_AUDITS) process.env.MAX_CONCURRENT_AUDITS = '2';
