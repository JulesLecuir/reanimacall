const {welcome} = require('../../routes/ivr/handler_ivr');
const UserService = require('../../users/user_service');
require('dotenv').config();
const mock = require('../mock');

beforeEach(async function () {

    await mock.initDatabase("handler_ivr_test");

    // Populate the db
    await UserService.create(mock.userRegistered);
});


describe("#Welcome", function () {

    describe("If user already registered", function () {

        // TODO throws a timeout error, Jest is just stuck waiting and fails after timeout.
        it('should welcome the user and ask for a PIN', async function () {

            const twiml = await welcome(mock.userRegistered.phone);

            expect(twiml).toContain('Bonjour');
            expect(twiml).toContain('Gather');
            expect(twiml).toContain('Say');
            expect(twiml).toContain('action="/ivr/reg/authPin"');

        });


    });
});