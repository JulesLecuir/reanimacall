const Formatter = require('../../_helpers/formatter');
const {phoneCountryCode} = require('../../config.json')

describe("#formatPhoneToInternational", function () {
    it("should replace the zero at the beginning with the country code", function () {
        phoneWithoutCode = "0612345678";
        phoneWithCode = phoneCountryCode + "612345678";
        expect(Formatter.formatPhoneToInternational(phoneWithoutCode)).toEqual(phoneWithCode);
    })
})

describe("#formatPhoneF", function () {

    it("should format correctly an international phone number", function () {
        phone = "+33612345678";
        phoneSpoken = "+33 6 12 34 56 78";

        //without isInternational parameter
        expect(Formatter.formatPhoneForSpoken(phone)).toEqual(phoneSpoken);
        // With isInternational parameter
        expect(Formatter.formatPhoneForSpoken(phone, true)).toEqual(phoneSpoken);
    });

    it("should format correctly a french number without international code", function () {
        phone = "0612345678";
        phoneSpoken = "06 12 34 56 78";

        // With isInternational parameter
        expect(Formatter.formatPhoneForSpoken(phone, false)).toEqual(phoneSpoken);
    });
})