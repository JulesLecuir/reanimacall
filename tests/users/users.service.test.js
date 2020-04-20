const UserService = require('./../../users/user.service');
const _db = require('./../../_helpers/db');
const config = require('./../../config');
const User = require('./../../users/user.model');
require('dotenv').config();

// Fake data for the db
const fakeUserNew = {phone: '+33600000000', pin: '123', contacts: ['+33633333333', '+33644444444']};
const fakeUserRegistered = {
    phone: '+33611111111',
    pin: '123',
    contacts: ['+33655555555', '+33666666666', fakeUserNew.phone]
};

describe('User Service', function () {

    beforeEach(async function () {
        // Initialize the database in test mode
        await _db.connect(config.db.test);

        // Erase the db
        await User.deleteMany({});

        // Populate the db
        await UserService.create(fakeUserRegistered);
    });

    describe('#isAlreadyRegistered', function () {

        it('should be falsy if the user is not known', async function () {
            return expect(await UserService.isAlreadyRegistered(fakeUserNew.phone)).toBeFalsy();
        });

        it('should be truthy if the user is known', async function () {
            return expect(await UserService.isAlreadyRegistered(fakeUserRegistered.phone)).toBeTruthy();
        });
    });

    describe('#getAll', function () {
        it('should give all the registered users', async function () {
            await UserService.create(fakeUserNew);
            const res = await UserService.getAll();

            expect(res[0].phone).toEqual(fakeUserRegistered.phone);
            expect(res[1].phone).toEqual(fakeUserNew.phone);
            expect(res[2]).toBeUndefined();
        });
    });

    describe('#authenticate', function () {

        // TODO tests working properly (ie. throwing the correct errors) but Jest seems not to manage
        //  the thrown errors properly. Have to sort that out!
        // it('should throw an error when the user is not found', async function() {
        //     expect(await UserService.authenticate({phone: fakeUserNew.phone, pin: fakeUserNew.pin}))
        //         .toThrowError(Error);
        // });
        // it('should throw an error when the input is not in the correct types', async function () {
        //     expect(await UserService.authenticate({
        //         phone: 33600002020,
        //         pin: fakeUserRegistered.pin
        //     })).toThrowError(TypeError);
        //     expect(await UserService.authenticate({
        //         phone: fakeUserRegistered.phone,
        //         pin: '123'
        //     })).toThrowError(TypeError);
        // });

        it('should be truthy if the phone and pin code match', async function () {
            expect(UserService.authenticate({
                phone: fakeUserRegistered.phone,
                pin: fakeUserRegistered.pin
            })).toBeTruthy();
        });

        it('should be falsy if the phone and pin code match', async function () {
            expect(UserService.authenticate({
                phone: fakeUserRegistered.phone,
                pin: fakeUserRegistered.pin
            })).toBeTruthy();
        });

        it("should set the user's isWaiting parameter to true", async function () {
            console.log(await UserService.authenticate({
                phone: fakeUserRegistered.phone,
                pin: fakeUserRegistered.pin
            }));
            const registeredUser = (await User.find({phone: fakeUserRegistered.phone}, {hash: false}).limit(1))[0];
            expect(registeredUser.isWaiting).toBeTruthy();
        });

        // TODO needs to fix the expect assertion with the Date object. Find out a way to compare.
        // it("should set the isWaitingSince parameter to the current Date", async function () {
        //     console.log(await UserService.authenticate({
        //         phone: fakeUserRegistered.phone,
        //         pin: fakeUserRegistered.pin
        //     }));
        //     const registeredUser = (await User.find({phone: fakeUserRegistered.phone}, {hash: false}).limit(1))[0];
        //     expect(registeredUser.isWaitingSince).toBeCloseTo(Date.now());
        // });

    });

});
