const LOG = require('./LOG');
module.exports = {

    /**
     * Checks if the arguments are strings and are not undefined
     * @param args can accept any arguments or spread operator (for example "aa", ...["fe", "ff"], or even ...[])
     */
    str: (...args) => {
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] !== 'string' || args[i] === '') {
                const err = new TypeError(`Variable n°${i + 1} is not of type String or is empty`);
                LOG.error(err);
                throw err;
            }
        }
    }
};