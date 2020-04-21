const check = require('./check');

module.exports = {

    formatPhoneNumberForSpoken: function (number) {
        check.str(number);
        const formattedNumber = Array.from(number);
        for (const i of [3, 5, 8, 11, 14])
            formattedNumber.splice(i, 0, ' ');
        return formattedNumber.join('');
    },

    spaceBetweenEachLetter: function (str) {
        check.str(str);
        const strArray = Array.from(str);
        for (let i = 1; i < str.length * 2 - 2; i += 2)
            strArray.splice(i, 0, ' ');
        return strArray.join('');
    }
};
