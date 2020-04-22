const UserService = require('../../users/user_service');
const User = require('../../users/user_model');
require('dotenv').config();
const mock = require('../mock');

beforeEach(async function () {
    // Initialize the database in test mode
    await mock.initDatabase("users_service_test");

    // Populate the db
    await UserService.create(mock.userRegistered);
});

/**
 * isAlreadyRegistred
 */
describe("#isAlreadyRegistered", function () {

    it("should be falsy if the user is not known", async function () {
        expect(await UserService.isAlreadyRegistered(mock.userNew.phone)).toBeFalsy();
    });

    it("should be truthy if the user is known", async function () {
        expect(await UserService.isAlreadyRegistered(mock.userRegistered.phone)).toBeTruthy();
    });
});

/**
 * getAll
 */
describe("#getAll", function () {
    it("should give all the registered users", async function () {
        await UserService.create(mock.userNew);
        const res = await UserService.getAll();

        expect(res[0].phone).toEqual(mock.userRegistered.phone);
        expect(res[1].phone).toEqual(mock.userNew.phone);
        expect(res[2]).toBeUndefined();
    });
});

/**
 * authenticate
 */
describe('#authenticate', function () {

    it('should throw a TypeError when the input is not of correct type or inexistant', async function () {
        // phone, pin and callSid are compulsory for this function.
        await expect(UserService.authenticate({phone: mock.userRegistered.phone, pin: mock.userRegistered.pin}))
            .rejects.toThrow(TypeError);
        await expect(UserService.authenticate({pin: mock.userRegistered.pin, callSid: mock.userRegistered.callSid}))
            .rejects.toThrow(TypeError);
        await expect(UserService.authenticate({
            phone: mock.userRegistered.phone,
            pin: mock.userRegistered.pin,
            callSid: 4567
        }))
            .rejects.toThrow(TypeError);
    });

    it('should throw an error when the user is not found', async function () {
        await expect(UserService.authenticate({
            phone: mock.userNew.phone,
            pin: mock.userNew.pin,
            callSid: mock.userNew.callSid
        })).rejects.toThrow(Error);
    });

    it("should return truthy if phone and pin correct", async function () {
        expect(await UserService.authenticate({
            phone: mock.userRegistered.phone,
            pin: mock.userRegistered.pin,
            callSid: mock.userRegistered.callSid
        })).toBeTruthy();
    });

    describe("if pin is correct", function () {

        const userData = {
            phone: mock.userRegistered.phone,
            pin: mock.userRegistered.pin,
            callSid: 'CAitsanewcallsidyeahthatsgreat'
        };

        it("should change the user status to 'asking'", async function () {
            await UserService.authenticate(userData);
            const registeredUser = (await User.find({phone: mock.userRegistered.phone}, {hash: false}).limit(1))[0];
            expect(registeredUser.status).toEqual('asking');
        });

        it("should register the new callSid when authenticating", async function () {
            await UserService.authenticate(userData);
            const registeredUser = (await User.find({phone: mock.userRegistered.phone}, {hash: false}).limit(1))[0];
            expect(registeredUser.callSid).toEqual(userData.callSid);
        });

    });

});


/**
 * create
 */
describe("#create", function () {

    // TODO implement tests

    it("should throw TypeError if bad parameters", async function () {
        // phone, pin and callSid are compulsory for this function.
        await expect(UserService.create({phone: mock.userNew.phone, pin: mock.userNew.pin}))
            .rejects.toThrow(TypeError);
        await expect(UserService.create({phone: mock.userNew.phone, pin: mock.userNew.pin, callSid: 4567}))
            .rejects.toThrow(TypeError);
        await expect(UserService.create({phone: mock.userNew.phone, pin: mock.userNew.pin, callSid: 4567}))
            .rejects.toThrow(TypeError);
    });

    it("should throw Error if user already registered", async function () {

    });

    it("should throw Error if user already registered", async function () {

    });

})

/**
 * isAlreadyRegistred
 */

/**
 * addContacts
 */

/**
 * getContacts
 */

