const config = require('../config.json');
const mongoose = require('mongoose');
const User = require('../users/user.model');
const UserService = require('../users/user.service');

mongoose.connect(config.connectionString, { useCreateIndex: true, useNewUrlParser: true });
mongoose.Promise = global.Promise;

if (config.resetDatabase)
    resetDatabase()
        .then(() => console.log("Database reset done."))
        .catch(function () {
            throw "Database reset failed";
        } );

async function resetDatabase() {
    await User.deleteMany({});
    await UserService.create(config.usersPopulation[0]);
}