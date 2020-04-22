const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {type: String, unique: true, required: true},
    hash: {type: String, required: true},
    firstName: {type: String},
    createdDate: {type: Date, default: Date.now()},
    contacts: {type: Array, default: []},
    status: {type: String, enum: ['inactive', 'asking', 'waiting', 'calledBack'], default: 'inactive'},
    callSid: {type: String, required: () => this.status !== 'inactive'},
});

userSchema.set('toJSON', {virtuals: true});
const User = mongoose.model('User', userSchema);

module.exports = User;