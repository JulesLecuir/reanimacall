const _db = require('../db');

const userNew = {
    phone: '+33600000000',
    pin: '123',
    contacts: ['+33633333333', '+33644444444'],
    callSid: 'CAvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv'

};

const userRegistered = {
    phone: '+33611111111',
    pin: '123',
    contacts: ['+33655555555', '+33666666666', userNew.phone],
    callSid: 'CAyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy'
};

async function initDatabase(databaseName) {
    // Initialize the database in test db
    await _db.connect(databaseName);
}

module.exports = {
    userNew,
    userRegistered,
    initDatabase
}