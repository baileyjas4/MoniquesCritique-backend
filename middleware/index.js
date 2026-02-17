// Export all middleware from a single file
const authenticate = require('./authenticate');
const authorizeOwnership = require('./authorizeOwnership');

module.exports = {
  authenticate,
  authorizeOwnership
};
