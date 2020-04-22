// IMPORTS
// Twilio
const VoiceResponse = require('twilio').twiml.VoiceResponse;
// Database
const UserService = require("../../users/user.service");
// Handlers
const welcomeNewUser = require('./new_user/handler_new_user').welcome;
const welcomeRegisteredUser = require('./registered_user/handler_registered_user').welcome;
// Helpers
const Formatter = require('../../_helpers/formatter');
const LOG = require('../../_helpers/LOG');
const {voice} = require('../../config');

// EXPORTS
module.exports = {
    welcome,
    redirectWelcome
};

/**
 * Welcome function for people calling in. Redirects to the path for registered or for new users.
 */
async function welcome(fromNumber) {

    const fromNumberFormatted = Formatter.formatPhoneNumberForSpoken(fromNumber);

    LOG.info(`Incoming call from number ${fromNumberFormatted}`);

    // If the person has already an account, authenticate. Otherwise, redirect to register.
    if (await UserService.isAlreadyRegistered(fromNumber)) {
        LOG.info(`User already registered. Asking for password.`);
        return welcomeRegisteredUser(fromNumberFormatted);
    } else {
        LOG.info(`New user. Asking for creation of a new password.`);
        return welcomeNewUser(fromNumberFormatted);
    }
}


/**
 * Redirects the user to the main menu
 */
function redirectWelcome() {
    const twiml = new VoiceResponse();

    twiml.say(voice.normal, 'Retour au menu principal.');

    twiml.redirect('/ivr/welcome');

    return twiml.toString();
}

