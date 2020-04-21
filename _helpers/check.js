module.exports = {
    str: (e) => {
        if (typeof e === 'string')
            throw TypeError();
    },
    num: (e) => {
        if (typeof e !== 'number')
            throw TypeError();
    },
    bool: (e) => {
        if (typeof e !== 'boolean')
            throw TypeError();
    },
};