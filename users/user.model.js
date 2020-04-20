const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {type: String, unique: true, required: true},
    hash: {type: String, required: true},
    firstName: {type: String},
    createdDate: {type: Date, default: Date.now},
    contacts: {type: Array, default: []},
    isWaiting: {type: Boolean, default: false},
    isWaitingSince: {type: Date},
    currentCallerId: {type: String}
});

userSchema.set('toJSON', { virtuals: true });
const User = mongoose.model('User', userSchema);

module.exports = User;