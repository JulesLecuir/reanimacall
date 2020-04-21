const LOG = require('./LOG');
module.exports = {
    str: (...args) => {
        for (let e of args) {
            if (typeof e !== 'string') {
                const err = new TypeError();
                LOG.error(err);
                throw TypeError();
            }
        }
    },
    num: (...args) => {
        for (let e of args) {
            if (typeof e !== 'number') {
                const err = new TypeError();
                LOG.error(err);
                throw TypeError();
            }
        }
    },
    bool: (...args) => {
        for (let e of args) {
            if (typeof e !== 'boolean') {
                const err = new TypeError();
                LOG.error(err);
                throw TypeError();
            }
        }
    },
};

module.exports.str("a", "accc", "aaecceec");
module.exports.str("afe", 122, "éed");