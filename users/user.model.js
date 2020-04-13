const mongoose = require('mongoose');
const config = require('../config.json');

const userSchema = new mongoose.Schema({
    phone: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    firstName: { type: String },
    createdDate: { type: Date, default: Date.now },
    contacts: { type: Map, default: {} },
    isOnline: { type: Boolean, default: false },
    currentCallerId: { type: String }
});

userSchema.set('toJSON', { virtuals: true });
const User = mongoose.model('User', userSchema);

module.exports = User;