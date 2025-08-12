// Simple node-fetch shim for Jest to avoid ESM-only import issues
// Prefer global fetch if available (Node 18+)
module.exports = (...args) => {
  if (typeof fetch !== 'undefined') return fetch(...args);
  throw new Error('fetch is not available in this test environment. Provide a mock or enable Node 18 global fetch.');
};
