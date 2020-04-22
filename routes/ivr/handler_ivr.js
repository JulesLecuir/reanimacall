const VoiceResponse = require('twilio').twiml.VoiceResponse;
const UserService = require("../../users/user_service");
const HandlerNewUser = require('./new_user/handler_new_user');
const HandlerRegisteredUser = require('./registered_user/handler_registered_user');
const Formatter = require('../../_helpers/formatter');
const LOG = require('../../_helpers/LOG');
const check = require("../../_helpers/check");
const {voice} = require('../../config');

module.exports = {
    welcome,
    redirectWelcome,
    offerMainMenu,
    mainMenu
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
        return HandlerRegisteredUser.welcome(fromNumberFormatted);
    } else {
        LOG.info(`New user. Asking for creation of a new password.`);
        return HandlerNewUser.welcome(fromNumberFormatted);
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


/**
 * Speaks the main menu
 */
function offerMainMenu() {

    const twiml = new VoiceResponse();

    twiml
        .gather({
            action: '/ivr/mainMenu',
            numDigits: '1',
            method: 'POST',
        })
        .say(
            voice.loop,
            'Si vous souhaitez envoyer une requête, tapez 1. ' + 'Si vous souhaitez ajouter un contact, tapez 2. ' +
            'Sinon, tapez 3 pour revenir au menu principal.'
        );

    return twiml.toString();
}


/**
 * Receives the input of the main menu
 */
function mainMenu(digit) {

    check.str(digit);

    const twiml = new VoiceResponse();

    const menu = {
        '1': HandlerRegisteredUser.offerRecordMessage,
        '2': () => {
            return twiml
                .gather({
                    action: '/ivr/reg/addContact',
                    numDigits: 10,
                    method: 'POST',
                })
                .say(
                    voice.normal,
                    'Vous pouvez à présent taper le numéro à ajouter à vos contacts.'
                )
                .toString();
        },
        '3': redirectWelcome
    }

    return menu[digit]();
}
