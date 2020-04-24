const bcrypt = require('bcryptjs');
const User = require('./user_model');
const check = require('./../_helpers/check');
const LOG = require("../_helpers/LOG");

module.exports = {
    authenticate,
    create,
    update,

    isAlreadyRegistered,

    getOne,
    getOneLean,

    getAll,
    getAllLean,

    getContacts,
    addContacts,

    delete: _delete
};


/**
 * Authenticate the user
 * @param phone
 * @param pin
 * @param callSid
 * @returns {Promise<boolean>} true if authentication successful or throws an error
 */
async function authenticate({phone, pin, callSid}) {

    check.str(phone, pin, callSid);

    // Query the user if there is any
    const userQuery = await User.find({phone: phone}, {hash: true, isActive: true}).limit(1);

    // Check that a user has matched and that the phone and pin code match
    if (userQuery[0] && bcrypt.compareSync(pin, userQuery[0].hash)) {
        // Update the call ID and the status of the customer
        await User.updateOne({phone: phone}, {status: 'asking', callSid: callSid});
        LOG.info(`User ${phone} authenticated.`);
        return true;
    } else {
        throw Error('User not authenticated. Either the user was not found, or the pin code didn\'t match.');
    }
}


/**
 * Create a new user
 * @param userParam must include phone, pin and callSid. Can also include an array of contacts. Everything must be strings.
 * @returns {Promise<void>} true if creation successful or throws an error
 */
async function create(userParam) {

    // Check data
    check.str(
        userParam.phone,
        userParam.pin,
        userParam.callSid,
        ...(Array.isArray(userParam.contacts) ? userParam.contacts : []) // Check contacts if there are any
    );

    if (await User.exists({phone: userParam.phone})) {
        LOG.info(`User ${userParam.phone} created.`);
        throw Error('Phone "' + userParam.phone + '" is already taken');
    }

    const user = new User(userParam);

    // hash pin
    if (userParam.pin) {
        user.hash = bcrypt.hashSync(userParam.pin, 10);
    }

    // save user
    await user.save();

    LOG.info(`User ${userParam.phone} created.`);
}

async function update(conditions, userParam) {

    checkUserParam(userParam);


    // get the user but remove the pin of the conditions in case it is given because there is no pin in the db
    const conditionsWithoutPin = {...conditions};
    delete conditionsWithoutPin.pin;
    const user = await getOne(conditionsWithoutPin, {});

    // if user doesn't exist
    if (!user) throw LOG.error(Error('User not found'));

    // if we want to change to another phone number but it already exists in the database
    if (user.phone !== userParam.phone && await User.findOne({phone: userParam.phone}))
        throw LOG.error(Error('Phone "' + userParam.phone + '" is already taken'));

    // if there is a pin in the params but not the current pin in the conditions throw
    if (userParam.pin && !conditions.pin)
        throw LOG.error(Error("When modifying the PIN you should enter the current pin as well as a selector"));

    // if the pin entered in the conditions object is correct, allow for pin modification
    if (conditions.pin && bcrypt.compareSync(conditions.pin, user.hash)) {
        userParam.hash = bcrypt.hashSync(userParam.pin, 10);
        LOG.info(`PIN for user ${user.phone} was modified`);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();

    LOG.info(`User ${userParam.phone} updated.`);
}

async function isAlreadyRegistered(number) {
    return await User.exists({phone: number});
}

// TODO test getOne and getOneLean!
async function getOne(conditions, selection = {hash: false}) {
    return (await User.find(conditions).select(selection).limit(1))[0];
}

async function getOneLean(conditions, selection = {hash: false}) {
    return (await User.find(conditions).select(selection).lean().limit(1))[0];
}

// TODO add hash for validation
async function getContacts(phone, currentCallSid) {
    const user = (await getOneLean({phone}, {contacts: true}));
    if (user.callSid === currentCallSid)
        return user.contacts;
    else
        throw Error("CallSid didn't match");
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getAllLean() {
    return await User.find().select('-hash').lean();
}

async function addContacts(phone, ...contacts) {
    const res = await User.updateOne({phone: phone}, {contacts: [...contacts]});
    return res.nModified;
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}

function checkUserParam(userParam) {

    check.str(userParam.phone ? userParam.phone : "a",
        userParam.pin ? userParam.pin : "a",
        userParam.callSid ? userParam.callSid : "a",
        userParam.status ? userParam.status : "a",
        ...(Array.isArray(userParam.contacts) ? userParam.contacts : []) // Check contacts if there are any
    );
}