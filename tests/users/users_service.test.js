const UserService = require('../../users/user_service');
const User = require('../../users/user_model');
require('dotenv').config();
const mock = require('../mock');

const userNew = mock.userNew;
const userRegistered = mock.userRegistered;

beforeAll(async function () {
    // Initialize the database in test mode
    await mock.initDatabase("users_service_test");
});

beforeEach(async function () {
    // Clean database
    await User.deleteMany({});
    // Populate the db
    await UserService.create(userRegistered);
});

/**
 * isAlreadyRegistred
 */
describe("#isAlreadyRegistered", function () {

    it("should be falsy if the user is not known", async function () {
        expect(await UserService.isAlreadyRegistered(userNew.phone)).toBeFalsy();
    });

    it("should be truthy if the user is known", async function () {
        expect(await UserService.isAlreadyRegistered(userRegistered.phone)).toBeTruthy();
    });
});

/**
 * getAll
 */
describe("#getAll", function () {
    it("should give all the registered users", async function () {
        await UserService.create(userNew);
        const res = await UserService.getAll();

        expect(res[0].phone).toEqual(userRegistered.phone);
        expect(res[1].phone).toEqual(userNew.phone);
        expect(res[2]).toBeUndefined();
    });
});

/**
 * authenticate
 */
describe('#authenticate', function () {

    it('should throw a TypeError when the input is not of correct type or inexistant', async function () {
        // phone, pin and callSid are compulsory for this function.
        await expect(UserService.authenticate({phone: userRegistered.phone, pin: userRegistered.pin}))
            .rejects.toThrow(TypeError);
        await expect(UserService.authenticate({pin: userRegistered.pin, callSid: userRegistered.callSid}))
            .rejects.toThrow(TypeError);
        await expect(UserService.authenticate({
            phone: userRegistered.phone,
            pin: userRegistered.pin,
            callSid: 4567
        }))
            .rejects.toThrow(TypeError);
    });

    it('should throw an error when the user is not found', async function () {
        await expect(UserService.authenticate({
            phone: userNew.phone,
            pin: userNew.pin,
            callSid: userNew.callSid
        })).rejects.toThrow(Error);
    });

    it("should return truthy if phone and pin correct", async function () {
        expect(await UserService.authenticate({
            phone: userRegistered.phone,
            pin: userRegistered.pin,
            callSid: userRegistered.callSid
        })).toBeTruthy();
    });

    describe("if pin is correct", function () {

        const userData = {
            phone: userRegistered.phone,
            pin: userRegistered.pin,
            callSid: 'CAitsanewcallsidyeahthatsgreat'
        };

        beforeEach(async function () {
            await UserService.authenticate(userData);
        })

        it("should change the user status to 'asking'", async function () {
            const registeredUser = (await User.find({phone: userRegistered.phone}, {hash: false}).limit(1))[0];
            expect(registeredUser.status).toEqual('asking');
        });

        it("should register the new callSid when authenticating", async function () {
            const registeredUser = (await User.find({phone: userRegistered.phone}, {hash: false}).limit(1))[0];
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
        await expect(UserService.create({phone: userNew.phone, pin: userNew.pin}))
            .rejects.toThrow(TypeError);
        await expect(UserService.create({phone: userNew.phone, pin: userNew.pin, callSid: 4567}))
            .rejects.toThrow(TypeError);
        await expect(UserService.create({phone: userNew.phone, pin: userNew.pin, callSid: 4567}))
            .rejects.toThrow(TypeError);
    });

    it("should throw Error if user already registered", async function () {

    });

    it("should throw Error if user already registered", async function () {

    });

    describe("if account successfully created", function () {

        const userData = {
            phone: userNew.phone,
            pin: userNew.pin,
            callSid: userNew.callSid
        };

        beforeEach(async function () {
            await UserService.create(userData);
        })

        it("should change the user status to 'inactive'", async function () {
            const registeredUser = (await User.find({phone: userData.phone}, {hash: false}).limit(1))[0];
            expect(registeredUser.status).toEqual('inactive');
        });

        it("should register the new callSid when creating the account", async function () {
            const registeredUser = (await User.find({phone: userData.phone}, {hash: false}).limit(1))[0];
            expect(registeredUser.callSid).toEqual(userData.callSid);
        });

    })

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

