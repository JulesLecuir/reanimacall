// Set the timezone for tests
process.env.TZ = 'GMT';

// Compatibility between mongoose and Jest
module.exports = {
    testEnvironment: 'node'
};