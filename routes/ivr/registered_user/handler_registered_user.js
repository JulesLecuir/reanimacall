require('dotenv').config();
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const {voice} = require('../../../config');
const UserService = require('../../../users/user_service');
const LOG = require('./../../../_helpers/LOG');
const Formatter = require("../../../_helpers/formatter");
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
    askContactRecursive
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
            // TODO debug: uncomment for final version
            'Vous nous appelez depuis le numéro ' + numberFormatted + '.' +
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
            .authenticate(phone, pin, callSid)
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
        // TODO debug: uncomment for final version
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
        "vous rappelons dès que nous obtenons une réponse positive d'un d'eux. " +
        "Voici votre enregistrement, il sera diffusé."
    );
    twiml.play(recordingUrl);

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

    await launchContactingProcedure(callSid, messageUrl);

    return 200;
}

async function addContact(phone, contactNumber) {
    await UserService.addOneContact(phone, contactNumber);
    LOG.success(`Contact ${contactNumber} was successfully added to ${phone} account`);
    const twiml = new VoiceResponse();
    twiml.say(voice.normal,
        `Le contact ${Formatter.formatPhoneForSpoken(contactNumber, false)} 
        a été ajouté au compte ${Formatter.formatPhoneForSpoken(phone)}.`);
    twiml.redirect('/ivr/offerMainMenu');
    return twiml.toString();
}

//
// TODO: under construction, nothing is safe below this line
//

async function launchContactingProcedure(callSid, messageUrl) {

    // retrieve contacts
    const {phone, contacts: contactsNumbers} = await UserService.getOneLean({callSid: callSid}, {
        phone: true,
        contacts: true
    });

    // contact the first person (ie. contactIndex = 0)
    const contactAgreedIndex = askContactRecursive(phone, contactsNumbers, 0, messageUrl);

    // if there is somebody that accepts, then dial the caller's phone number.
}

async function askContactRecursive(phone, contactsNumbers, contactIndex, messageUrl, digits = null) {

    const twiml = new VoiceResponse();

    // "123" is the myParam variable I want to pass
    twiml
        .gather({
            action: '/ivr/handleChoice/123',
            numDigits: '1',
            method: 'GET'
            // I use get because I couldn't figure a better way to pass a variable to the function #handleChoice
            // than this way. Maybe you have a better idea?
        })
        .say("Tap 1 or 2");

    // Call the contact, and get the answer
    await client.calls
        .create({
            twiml: twiml.toString(),
            to: "+33685049061",  // my own number, so I can call myself for debugging
            from: "+33644607189" //my Twilio number
        })

    // // If no digits are passed, it means the function is run for the first time and doesn't need to treat answer
    // // Else, it needs to redirect to a menu, and need to return a res object to Twilio (to thank the callee).
    //
    // if (digits === "1") {
    //     // Request is accepted, we dial the initial caller and put them together.
    //     return '<Response><Say>Hello! Goodbye!</Say></Response>'
    //     //dialOtherParty(phone, contactsNumbers[contactIndex]);
    // }
    //
    // const twimlAsk = new VoiceResponse();
    //
    // // Forward message
    // // twimlAsk.say(voice.normal,
    // //     "Bonjour, nous sommes le service Réanima kaul et nous venons vous faire passer un message du numéro " +
    // //     Formatter.formatPhoneNumberForSpoken(phone) + ". Voici son message:");
    // // twimlAsk.play(messageUrl);
    //
    // // Ask for decision
    // twimlAsk
    //     .gather({
    //         numDigits: '1',
    //     })
    //     .say(voice.normal,
    //         // "Pour accepter " +
    //         // "la demande et être mis en relation avec cet interlocuteur, " +
    //         "tapez 1, sinon, tapez 2 pour refuser la demande.");
    //
    // // Call the contact, and get the answer
    // client.calls
    //     .create({
    //         twiml: twimlAsk.toString(),
    //         to: Formatter.formatPhoneToInternational(contactsNumbers[contactIndex]),
    //         from: process.env.TWILIO_PHONE_NUMBER
    //     })
    //     .then(call => {
    //         console.log(call);
    //     });
}

async function dialOtherParty(phone, contactPhone) {
    return new VoiceResponse()
        .say(voice.normal,
            "Nous rappelons votre correspondant et nous vous mettons en relation.")
        .dial({
            action: 'ivr/reg/dialEvent',
            record: 'do-not-record',
            callReason: 'REANIMACALL'
        })
        .toString();
}

async function dialEvent(dialStatus) {
    // TODO do something depending on status: DialCallStatus
    // If you specify an action URL, Twilio will always pass along the status of the <Dial> attempt.
    //
    // Possible DialCallStatus values are:
    // completed	The called party answered the call and was connected to the caller.
    // answered	When calling a conference, the called party answered the call and was connected to the caller.
    // busy	Twilio received a busy signal when trying to connect to the called party.
    // no-answer	The called party did not pick up before the timeout period passed.
    // failed	Twilio was unable to route to the given phone number. This is frequently caused by dialing a properly formatted but non-existent phone number.
    // canceled	The call was canceled via the REST API before it was answered.
}

// TODO debug
// askContactRecursive("+33xxxxxxxxx",
//     ["+33685049061"],
//     0,
//     "https://api.twilio.com/2010-04-01/Accounts/ACe847c3c095a53da4258248dadc63c792/Recordings/REb9701416f821cb863f6b65f01a042939"
// );