const LOG = require('./LOG');
module.exports = {
    str: (...args) => {
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] !== 'string') {
                const err = new TypeError(`Variable n°${i + 1} is not of type String`);
                LOG.error(err);
                throw err;
            }
        }
    }
};
