const VoiceResponse = require('twilio').twiml.VoiceResponse;
const {voice, messages} = require('../../../config');
const UserService = require("../../../users/user_service");
const {spaceBetweenEachLetter} = require("../../../_helpers/formatter");
const LOG = require('./../../../_helpers/LOG');


module.exports = {
    welcome,
    createAccount
};

function welcome(fromNumberFormatted) {

    const twiml = new VoiceResponse();
    // TODO add directly a tracking of the callSid here so we can track unique call numbers from the beginning.
    twiml
        .gather({
            action: '/ivr/new/createAccount',
            finishOnKey: '#',
            method: 'POST',
        })
        .say({
                ...voice.normal,
                loop: 3
            },
            'Bonjour. ' +
            'Vous nous appelez depuis le numéro ' + fromNumberFormatted + '.' +
            'Si vous souhaitez créer un compte, veillez choisir un nouveau code PINE. Ce code PINE vous servira ' +
            'pour vous authentifier ultérieurement lorsque vous appellerez avec ce numéro. Vous pouvez maintenant ' +
            'taper votre code PINE, puis appuyer sur dièse pour valider votre inscription.'
        );

    return twiml.toString();
}

async function createAccount(fromNumber, digits, callSid) {

    const twiml = new VoiceResponse();
    // Create a user. if the user is already created, send an error.
    await Promise.all([
        UserService
            .create({phone: fromNumber, pin: digits, callSid: callSid})
            .then(() => {
                    LOG.success("Account created");
                    twiml.say(
                        voice.normal,
                        `Votre compte a été créé avec le pine, ${spaceBetweenEachLetter(digits)}.
                     Vous allez bientôt pouvoir ajouter des numéros à contacter, ou faire passer une requête. Vous allez être redirigé pour vous authetifier avec le PINE qe vous venez de saisir.`
                    );
                    LOG.info('Redirecting to the addContactMenu.');
                    twiml.redirect('/ivr/welcome');
                }
            )
            .catch((err) => {
                    LOG.error(err, "Account could not be created.");
                    twiml.say(voice.normal, messages.errorOccurred);
                }
            )
    ]);

    return twiml.toString();
}


//    await UserService.addContacts(fromNumber, ["+336844473313", "+33756617277", "+33684433473313", "+337566174277"]);