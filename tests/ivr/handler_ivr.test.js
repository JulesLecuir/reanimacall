const {welcome} = require('../../routes/ivr/handler_ivr');
const UserService = require('../../users/user_service');
require('dotenv').config();
const User = require('../../users/user_model');
const {countWord} = require("../_helper");
const {userRegistered, initDatabase} = require('../mock');

beforeAll(async function () {
    // Initialize the database in test mode
    await initDatabase("handler_ivr_test");
});

beforeEach(async function () {
    // Clean database
    await User.deleteMany({});
    // Populate the db
    await UserService.create(userRegistered);
});


describe("#Welcome", function () {

    describe("If user already registered", function () {

        it('should welcome the user and ask for a PIN', async function () {

            const twiml = await welcome(userRegistered.phone);

            expect(countWord("Say", twiml)).toEqual(2);
            expect(twiml).toContain('Bonjour');
            expect(twiml).toContain('Gather');
            expect(twiml).toContain('Say');
            expect(twiml).toContain('action="/ivr/reg/authPin"');

        });


    });
});