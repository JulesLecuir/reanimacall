const VoiceResponse = require('twilio').twiml.VoiceResponse;
const {voice} = require('../../../config');
const UserService = require('../../../users/user.service');
const LOG = require('./../../../_helpers/LOG');


module.exports = {
    welcome,
    authPin,
    thankAfterMessage
};

function welcome(numberFormatted) {

    const twiml = new VoiceResponse();

    twiml
        .gather({
            action: '/ivr/reg/authPin',
            finishOnKey: '#',
            method: 'POST',
        })
        .say(voice.normal,
            'Bonjour. ' +
            // TODO remettre 'Vous nous appelez depuis le numéro ' + numberFormatted + '.' +
            ' Entrez votre code PINE, puis tapez dièse.'
        );
    twiml.pause({length: 10});

    // TODO gérer le cas où la personne n'entre rien du tout

    return twiml.toString();
}

async function authPin(phone, pin, callSid) {

    const twiml = new VoiceResponse();

    await Promise.all([
        UserService
            .authenticate({phone, pin, callSid})
            .then(() => {
                    LOG.success("Authentification réussie");
                    // TODO invoke a function if the user presses a key that memorizes that the user doesn't want to hear the messages before leaving a message
                    twiml.say(voice.normal,
                        "Merci. Vous pouvez maintenant formuler oralement votre demande. Nous ferons ensuite passer votre message à vos contacts. Sachez également" +
                        " que pour l'instant, vos messages ne sont pas chiffrés et peuvent faire l'objet d'attaques. Nous " +
                        "travaillons actuellement sur un système de chiffrement des enregistrements pour une prochaine " +
                        "version de notre service. Jules Lecuir, développeur de l'application, se dédouanne de tout préjudice," +
                        "bien qu'il travaille du mieux qu'il peut pour vous apporter son aide! Vous pouvez maintenant parler.");
                    twiml.record({
                            action: "/ivr/reg/thankAfterMessage",
                            recordingStatusCallback: "/users/processMessage",
                            finishOnKey: '#',
                            maxLength: 180,
                        }
                    )
                }
            )
            .catch((err) => {
                    LOG.warn(err);
                    twiml.say(voice.normal, "Le PINE que vous avez saisi ne semble pas correspondre.");
                    twiml.redirect('/ivr/redirectWelcome');
                }
            )
    ]);

    return twiml.toString();
}

function thankAfterMessage() {

    // TODO replay the message that the person just recorded. If the person hans up, validates, if presses any key, can record it again.
    return new VoiceResponse()
        .say(
            voice.normal,
            "Merci pour votre message. Nous appelons vos contacts et nous " +
            "vous rappelons dès que nous obtenons une réponse positive d'un d'eux."
        )
        .toString();
}