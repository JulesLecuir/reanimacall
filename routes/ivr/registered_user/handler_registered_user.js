const VoiceResponse = require('twilio').twiml.VoiceResponse;
const {voice} = require('../../../config');
const UserService = require('../../../users/user_service');
const LOG = require('./../../../_helpers/LOG');
const Mutex = require('async-mutex').Mutex;
const Semaphore = require('async-mutex').Semaphore;

const mutexesSema = new Semaphore(1);
mutexes = {};

module.exports = {
    welcome,
    authPin,
    thankAfterMessage,
    offerRecordMessage,
    processMessage,
    addContact,
};


function welcome(numberFormatted) {

    const twiml = new VoiceResponse();

    twiml
        .gather({
            action: '/ivr/reg/authPin',
            timeout: 10
        })
        .say(voice.normal,
            'Bonjour. ' +
            // TODO debug
            // 'Vous nous appelez depuis le numéro ' + numberFormatted + '.' +
            ' Entrez votre code PINE, puis tapez dièse.'
        );

    // If the person doesn't enter anything, redirect
    twiml.redirect('/ivr/noPinEntered');

    return twiml.toString();
}

async function authPin(phone, pin, callSid) {

    const twiml = new VoiceResponse();

    await Promise.all([
        UserService
            .authenticate({phone, pin, callSid})
            .then(() => {
                    LOG.success("Authentification réussie");
                    twiml.say(voice.normal, 'Merci.');
                    twiml.redirect('/ivr/offerMainMenu');
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

function offerRecordMessage() {

    const twiml = new VoiceResponse();

    // TODO invoke a function if the user presses a key that memorizes that the user doesn't want to hear the messages before leaving a message
    twiml.say(voice.normal,
        "Merci. Vous pouvez maintenant formuler oralement votre demande. "
        // TODO debug
        // + "Nous ferons ensuite passer votre message à vos contacts. Sachez également" +
        // " que pour l'instant, vos messages ne sont pas chiffrés et peuvent faire l'objet d'attaques. Nous " +
        // "travaillons actuellement sur un système de chiffrement des enregistrements pour une prochaine " +
        // "version de notre service. Jules Lecuir, développeur de l'application, se dédouanne de tout préjudice," +
        // "bien qu'il travaille du mieux qu'il peut pour vous apporter son aide! Vous pouvez maintenant parler."
    );
    twiml.record({
            action: "/ivr/reg/thankAfterMessage",
            recordingStatusCallback: "/ivr/reg/processMessage",
            maxLength: 180,
        }
    )

    return twiml.toString();
}

async function thankAfterMessage(callSid, recordingUrl) {

    // Create a mutex so it can be a sync barrier before the recording message is processed.
    let [_, releaseSema] = await mutexesSema.acquire();
    try {
        (mutexes[callSid] = {}).mutex = new Mutex();
        mutexes[callSid].release = await mutexes[callSid].mutex.acquire();
    } finally {
        releaseSema();
    }

    // Then wait as long as the mutex is not released
    await mutexes[callSid].mutex.runExclusive(() => {
    });

    // And finally delete the mutex entry for this callSid
    [_, releaseSema] = await mutexesSema.acquire();
    try {
        delete mutexes[callSid];
    } finally {
        releaseSema();
    }

    const twiml = new VoiceResponse();
    twiml.say(voice.normal,
        "Merci pour votre message. Nous appelons vos contacts et nous " +
        "vous rappelons dès que nous obtenons une réponse positive d'un d'eux." +
        "Voici votre enregistrement. Il sera diffusé."
    );
    twiml.play(recordingUrl)

    return twiml.toString();
}

async function processMessage(messageUrl, callSid) {

    // release the syc barrier so that the recording can be played on the phone to te user
    const [_, releaseSema] = await mutexesSema.acquire();
    try {
        mutexes[callSid].release();
    } finally {
        releaseSema();
    }

    // TODO launch procedure to call all the other contacts + save the recording url in the DB.

    return 200;
}

function addContact() {
    //TODO add Contact
    return new VoiceResponse().say('le contact a pas été ajouté parce que y a pas encore de fonction pour ça.')
}