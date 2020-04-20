const bcrypt = require('bcryptjs');
const User = require('./user.model');

module.exports = {
    authenticate,
    getAll,
    getById,
    getByPhoneNumber,
    addContacts,
    getContacts,
    isAlreadyRegistered,
    create,
    update,
    delete: _delete
};

async function authenticate({phone, pin}) {
    if (typeof phone !== 'string' || typeof pin !== 'string')
        throw TypeError();
    const userQuery = await User.find({phone: phone}, {hash: true, isActive: true}).limit(1);
    if (userQuery[0] && bcrypt.compareSync(pin, userQuery[0].hash)) {
        await User.updateOne({phone: phone}, {isWaiting: true, isWaitingSince: Date.now()});
        return true;
    } else {
        return false;
    }
}

async function addContacts(phone, contactsArray) {
    const res = await User.updateOne({phone: phone}, {contacts: contactsArray});
    return res.nModified;
}

// TODO add hash for validation
async function getContacts(phone) {
    const user = (await getByPhoneNumber(phone));
    return user.contacts;
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function getByPhoneNumber(number) {
    return (await User.find({phone: number}, {hash: false}).limit(1))[0];
}

async function isAlreadyRegistered(number) {
    return await User.exists({phone: number});
}

async function create(userParam) {
    // validate
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

async function _delete(id) {
    await User.findByIdAndRemove(id);
}