const VoiceResponse = require('twilio').twiml.VoiceResponse;
const UserService = require("../../users/user.service");
const {welcomeNewUser} = require('./new_user/handler_new_user').welcome();
const {welcomeRegisteredUser} = require('./registered_user/handler_registered_user').welcome();
const Formatter = require('../../_helpers/formatter');
const {voice} = require('../../config');

module.exports = {
    welcome,
    redirectWelcome
};

/**
 * 1.
 * Welcome function for people calling in. Asks for password and redirects to the mainMenu proposition.
 * The user input is analyzed in the function #menu
 */
function welcome(fromNumber) {

    const fromNumberFormatted = Formatter.formatPhoneNumberForSpoken(fromNumber)

    console.info(`INCOMING CALL FROM NUMBER ${fromNumberFormatted}`);

    // If the person has already an account, authenticate. Otherwise, redirect to register.
    if (UserService.isAlreadyRegistered(fromNumberFormatted)) {
        console.info(`User already registered. Asking for password.`);
        return welcomeRegisteredUser(fromNumberFormatted);
    } else {
        console.info(`New user. Asking for creation of a new password.`);
        return welcomeNewUser(fromNumberFormatted);
    }
}

/**
 * Returns Twiml
 * @return {String}
 */
function getPatientInfo() {

    const twiml = new VoiceResponse();

    twiml.say(voice.normal,
        "Si vous souhaitez préciser quelques éléments," +
        " merci de les mentionner oralement juste après," +
        " puis tapez dièse pour enregistrer." +
        " Sinon, tapez n'importe quelle touche pour continuer sans enregistrer de message."
    );

    twiml.record({
        action: '/',
        method: 'GET',
        maxLength: 20
    });

    return twiml.toString();
}


/**
 * Redirects the user to the main menu
 * @return {String} VoiceResponse sent back to user
 */
/**
 * Returns an xml with the redirect
 * @return {String}
 */
function redirectWelcome() {
    const twiml = new VoiceResponse();

    twiml.say(voice.normal, 'Returning to the main menu');

    twiml.redirect('/ivr/welcome');

    return twiml.toString();
}


/** *************************************************************************************************
 * USELESS CODE
 * *************************************************************************************************/



/*
exports.callSomebodyElse = function callSomebodyElse(digit) {
    const optionActions = {
        '2': '+12024173378',
        '3': '+12027336386',
        '4': '+12027336637',
    };

    if (optionActions[digit]) {
        const twiml = new VoiceResponse();
        twiml.dial(optionActions[digit]);
        return twiml.toString();
    }

    return redirectWelcome();
};
*/

