const bcrypt = require('bcryptjs');
const User = require('./user.model');

module.exports = {
    authenticate,
    getAll,
    getById,
    getByPhoneNumber,
    isAlreadyRegistered,
    create,
    update,
    delete: _delete
};

async function authenticate({ phone, pin }) {
    const user = await User.find({ phone: phone }, { hash: true, contacts: true}).limit(1);
    if (user && bcrypt.compareSync(pin, user.hash)) {
        const contacts = user.toObject().contacts;
        return contacts;
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function getByPhoneNumber(number) {
    return await User.findOne({phone: number}).select('-hash');
}

function isAlreadyRegistered(number) {
    return User.find({phone: number}, {phone: true}).limit(1);
}

async function create(userParam) {
    // validate
    if (await User.findOne({ phone: userParam.phone })) {
        throw 'Phone "' + userParam.phone + '" is already taken';
    }

    const user = new User(userParam);

    // hash pin
    if (userParam.pin) {
        user.hash = bcrypt.hashSync(userParam.pin, 12);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.phone !== userParam.phone && await User.findOne({ phone: userParam.phone })) {
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