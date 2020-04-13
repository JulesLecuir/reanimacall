const VoiceResponse = require('twilio').twiml.VoiceResponse;
const LOG = require('morgan');
const {voice, messages} = require('../../../config');

module.exports = {
    welcome,
    createAccount
};

function welcome(fromNumberFormatted) {

    const twiml = new VoiceResponse();

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
            'Si vous souhaitez créer un compte, veillez choisir un nouveau code PIN. Ce code PIN vous servira ' +
            'pour vous authentifier ultérieurement lorsque vous appellerez avec ce numéro. Vous pouvez maintenant ' +
            'taper votre code PIN, puis appuyer sur dièse pour valider votre inscription.'
        );

    return twiml.toString();
}

async function createAccount(fromNumber, digits) {

    const twiml = new VoiceResponse();

    await Promise.all([
        // Create a user. if the user is already created, send an error.
        UserService
            .create({phone: fromNumber, pin: digits})
            .then(() => {
                    console.log("Compte créé");
                    twiml.say(voice.normal,
                        `Votre compte a été créé avec le pin ${digits}. Merci et au revoir.`);
                }
            )
            .catch(() => {
                    console.log("Compte non créé");
                    twiml.say(voice.normal, messages.errorOccurred);
                }
            )
    ]);

    return twiml.toString();
}