const HandlerRegisteredUser = require('../../../routes/ivr/registered_user/handler_registered_user');
const UserService = require('../../../users/user_service');
require('dotenv').config();
const User = require('../../../users/user_model');
const {countWord} = require("../../_helper");
const {userForCallsToMyself, initDatabase} = require('../../mock');

messageUrl = "https://api.twilio.com/2010-04-01/Accounts/ACe847c3c095a53da4258248dadc63c792/Recordings/REb9701416f821cb863f6b65f01a042939"

beforeAll(async function () {
    // Initialize the database in test mode
    await initDatabase("handler_registered_user_test");
});

beforeEach(async function () {
    // Clean database
    await User.deleteMany({});
    // Populate the db
    await UserService.create(userForCallsToMyself);
});

describe("#askContactRecursive", function () {
    it("should be tested lol", function () {
        // TODO debug. Use that only for degug. It's not operational otherwise. Working on it!
        // HandlerRegisteredUser.askContactRecursive(userForCallsToMyself.phone, userForCallsToMyself.contacts, 0, messageUrl);
    })
})


