const UserService = require('../../users/user_service');
const User = require('../../users/user_model');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const {userNew, userRegistered, userRegistered2, initDatabase} = require('../mock');


beforeAll(async function () {
    // Initialize the database in test mode
    await initDatabase("users_service_test");
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
 * getOne
 */
describe("#getOne", function () {

    it("should return everything without the hash if no selection argument is given", async function () {
        const userRegisteredFromDb = await UserService.getOne({phone: userRegistered.phone})
        expect(userRegisteredFromDb.hash).toBeUndefined();
        expect(userRegisteredFromDb.phone).toEqual(userRegistered.phone);
        expect(userRegisteredFromDb.callSid).toEqual(userRegistered.callSid);
        expect(userRegisteredFromDb.contacts[0]).toEqual(userRegistered.contacts[0]);
    });

    it("should return everything with the hash if a blank selection argument is given", async function () {
        const userRegisteredFromDb = await UserService.getOne({phone: userRegistered.phone}, {})
        expect(bcrypt.compareSync(userRegistered.pin, userRegisteredFromDb.hash)).toBeTruthy();
        expect(userRegisteredFromDb.phone).toEqual(userRegistered.phone);
        expect(userRegisteredFromDb.callSid).toEqual(userRegistered.callSid);
        expect(userRegisteredFromDb.contacts[0]).toEqual(userRegistered.contacts[0]);
    });

    it("should return only the things that are mentionned if a selection is given", async function () {
        const userRegisteredFromDb = await UserService.getOne({phone: userRegistered.phone}, {callSid: true})
        expect(userRegisteredFromDb.phone).toBeUndefined();
        expect(userRegisteredFromDb.contacts).toBeUndefined();
        expect(userRegisteredFromDb.hash).toBeUndefined();
        expect(userRegisteredFromDb.callSid).toEqual(userRegistered.callSid);
    });
});

/**
 * getOneLean
 */
describe("#getOne", function () {

    it("should return everything without the hash if no selection argument is given", async function () {
        const userRegisteredFromDb = await UserService.getOneLean({phone: userRegistered.phone})
        expect(userRegisteredFromDb.hash).toBeUndefined();
        expect(userRegisteredFromDb.phone).toEqual(userRegistered.phone);
        expect(userRegisteredFromDb.callSid).toEqual(userRegistered.callSid);
        expect(userRegisteredFromDb.contacts[0]).toEqual(userRegistered.contacts[0]);
    });

    it("should return everything with the hash if a blank selection argument is given", async function () {
        const userRegisteredFromDb = await UserService.getOneLean({phone: userRegistered.phone}, {})
        expect(bcrypt.compareSync(userRegistered.pin, userRegisteredFromDb.hash)).toBeTruthy();
        expect(userRegisteredFromDb.phone).toEqual(userRegistered.phone);
        expect(userRegisteredFromDb.callSid).toEqual(userRegistered.callSid);
        expect(userRegisteredFromDb.contacts[0]).toEqual(userRegistered.contacts[0]);
    });

    it("should return only the things that are mentionned if a selection is given", async function () {
        const userRegisteredFromDb = await UserService.getOneLean({phone: userRegistered.phone}, {callSid: true})
        expect(userRegisteredFromDb.phone).toBeUndefined();
        expect(userRegisteredFromDb.contacts).toBeUndefined();
        expect(userRegisteredFromDb.hash).toBeUndefined();
        expect(userRegisteredFromDb.callSid).toEqual(userRegistered.callSid);
    });
});

/**
 * authenticate
 */
describe('#authenticate', function () {

    it('should throw a TypeError when the input is not of correct type or inexistant', async function () {
        // phone, pin and callSid are compulsory for this function.
        await expect(UserService.authenticate(userRegistered.phone, userRegistered.pin))
            .rejects.toThrow(TypeError);
        await expect(UserService.authenticate(userRegistered.pin, userRegistered.callSid))
            .rejects.toThrow(TypeError);
        await expect(UserService.authenticate(userRegistered.phone, userRegistered.pin, 4567))
            .rejects.toThrow(TypeError);
    });

    it('should throw an error when the user is not found', async function () {
        await expect(UserService.authenticate(
            userNew.phone,
            userNew.pin,
            userNew.callSid
        )).rejects.toThrow(Error);
    });

    it("should return truthy if phone and pin correct", async function () {
        expect(await UserService.authenticate(
            userRegistered.phone,
            userRegistered.pin,
            userRegistered.callSid
        )).toBeTruthy();
    });

    describe("if pin is correct", function () {

        const userData = {
            phone: userRegistered.phone,
            pin: userRegistered.pin,
            callSid: 'CAitsanewcallsidyeahthatsgreat'
        };

        beforeEach(async function () {
            await UserService.authenticate(userData.phone, userData.pin, userData.callSid);
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
        await expect(UserService.create({phone: userRegistered.phone, pin: userRegistered.pin + '2'}))
            .rejects.toThrow(Error);
    });

    describe("if creation successful", function () {

        const userData = {
            phone: userNew.phone,
            pin: userNew.pin,
            callSid: userNew.callSid
        };

        beforeEach(async function () {
            await UserService.create(userData);
        });

        it("should change the user status to 'inactive'", async function () {
            const registeredUser = (await User.find({phone: userData.phone}, {hash: false}).limit(1))[0];
            expect(registeredUser.status).toEqual('inactive');
        });

        it("should register the new callSid when creating the account", async function () {
            const registeredUser = (await User.find({phone: userData.phone}, {hash: false}).limit(1))[0];
            expect(registeredUser.callSid).toEqual(userData.callSid);
        });

    });

});


/**
 * update
 */
describe("#update", function () {

    it("should throw TypeError if bad parameters", async function () {
        // phone, pin and callSid are compulsory for this function.
        await expect(UserService.update({phone: userRegistered.phone}, {phone: 221}))
            .rejects.toThrow(TypeError);
    });

    it("should throw Error if user doesn't exist", async function () {
        await expect(UserService.update(
            {phone: userNew.phone},
            {pin: 221}))
            .rejects.toThrow(Error);
        await expect(UserService.update(
            {phone: 2339902, pin: userNew.pin, callSid: 4567},
            {phone: userRegistered.phone}))
            .rejects.toThrow(Error);
    });

    it("should throw Error if phone number changed to a number that already exists", async function () {
        await UserService.create(userRegistered2);
        await expect(UserService.update(
            {phone: userRegistered.phone},
            {phone: userRegistered2.phone}))
            .rejects.toThrow(Error);
    });

    it("should throw Error if wrong user pin was passed as a parameter and no correct pin passed as selection", async function () {
        await expect(UserService.update(
            {phone: userRegistered.phone},
            {pin: userRegistered.pin + '22', phone: userRegistered2.phone}))
            .rejects.toThrow(Error);
    });


    describe("if update successful", function () {

        const userRegisteredUpdated = {
            phone: userRegistered.phone + 'MODIFIED',
            pin: userRegistered.pin + '22',
            callSid: userRegistered.callSid + 'MODIFIED'
        };

        it("should allow to modify PIN if correct pin passed as selection", async function () {
            await UserService.update(
                {phone: userRegistered.phone, pin: userRegistered.pin},
                {pin: userRegisteredUpdated.pin, callSid: userRegisteredUpdated.callSid});
            const userRegisteredFromDb = await UserService.getOneLean(
                {callSid: userRegisteredUpdated.callSid},
                {}
            );
            expect(bcrypt.compareSync(userRegisteredUpdated.pin, userRegisteredFromDb.hash)).toBeTruthy();
        });

        it("should really modify the user", async function () {
            await UserService.update(
                {phone: userRegistered.phone},
                {phone: userRegisteredUpdated.phone, callSid: userRegisteredUpdated.callSid});
            const userRegisteredFromDb = await UserService.getOneLean(
                {callSid: userRegisteredUpdated.callSid},
                {phone: true}
            );
            expect(userRegisteredFromDb.phone).toEqual(userRegisteredUpdated.phone);
        });

    });

});


/**
 * addContacts
 */

/**
 * getContacts
 */


