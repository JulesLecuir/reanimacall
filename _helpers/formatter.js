const check = require('./check');
const {phoneCountryCode} = require('../config')

module.exports = {

    formatPhoneForSpoken: function (number, isInternational = true) {
        check.str(number);
        const formattedNumber = Array.from(number);
        slicing = isInternational ? [3, 5, 8, 11, 14] : [2, 5, 8, 11];
        for (const i of slicing)
            formattedNumber.splice(i, 0, ' ');
        return formattedNumber.join('');
    },

    // TODO This is still a function that lacks predictability if no correct input. Should be improved.
    formatPhoneToInternational: function (number) {
        check.str(number);
        const formattedNumber = Array.from(number);
        if (formattedNumber[0] === '0') {
            formattedNumber.splice(0, 1, phoneCountryCode);
        }
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


