const bcrypt = require('bcryptjs');
const User = require('./user_model');
const check = require('./../_helpers/check');
const LOG = require("../_helpers/LOG");

module.exports = {
    authenticate,
    create,
    update,

    isAlreadyRegistered,
    getById,
    getByPhoneNumber,
    getContacts,

    getAll,

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
// TODO check how avoid redundancy of phone and callSid which is more secure and does not compromise performance
async function authenticate({phone, pin, callSid}) {

    check.str(phone, pin, callSid);

    // Query the user if there is any
    const userQuery = await User.find({phone: phone}, {hash: true, isActive: true}).limit(1);

    // Check that a user has matched and that the phone and pin code match
    if (userQuery[0] && bcrypt.compareSync(pin, userQuery[0].hash)) {
        // TODO need to check that the couple between phone and ongoingCallSid is correct before logging t in the DB.
        // Update the call ID and the status of the customer
        await User.updateOne({phone: phone}, {status: 'asking', callSid: callSid});
        LOG.info('User authenticated.')
        return true;
    } else {
        throw Error('User not authenticated. Either the user was not found, or the pin code didn\'t match.');
    }
}


/**
 * Create a new user
 * @param userParam must include phone, pin and callSid. Can also include an array of contacts. Everything must be strings.
 * @returns {Promise<void>}
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
        throw 'Phone "' + userParam.phone + '" is already taken';
    }

    const user = new User(userParam);

    // hash pin
    if (userParam.pin) {
        user.hash = bcrypt.hashSync(userParam.pin, 10);
    }

    // save user
    await user.save();
}

async function update(phone, userParam) {

    check.str(phone);
    // TODO find a way to check userParam? or maybe MongoDb does it already?

    const user = await getByPhoneNumber(phone);

    // validate
    if (!user) throw 'User not found';
    if (user.phone !== userParam.phone && await User.findOne({phone: userParam.phone})) {
        throw 'Phone "' + userParam.phone + '" is already taken';
    }

    // hash pin if it was entered
    if (userParam.pin) {
        userParam.hash = bcrypt.hashSync(userParam.pin, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}


async function isAlreadyRegistered(number) {
    return await User.exists({phone: number});
}


async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function getByPhoneNumber(number) {
    return (await User.find({phone: number}, {hash: false}).limit(1))[0];
}

// TODO add hash for validation
async function getContacts(phone, currentCallSid) {
    const user = (await getByPhoneNumber(phone));
    if (user.callSid === currentCallSid)
        return user.contacts;
    else
        throw Error("CallSid didn't match");
}

async function getAll() {
    return await User.find().select('-hash');
}

async function addContacts(phone, ...contacts) {
    const res = await User.updateOne({phone: phone}, {contacts: [...contacts]});
    return res.nModified;
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}