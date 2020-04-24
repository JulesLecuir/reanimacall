const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    phone: {type: String, unique: true, required: true},
    contacts: {type: Array, default: []},
    status: {type: String, required: true, enum: ['inactive', 'asking', 'waiting', 'calledBack'], default: 'inactive'},
    callSid: {type: String, unique: true, required: () => this.status !== 'inactive'},
    hash: {type: String, required: true},
    createdDate: {type: Date, default: Date.now()}
});

userSchema.set('toJSON', {virtuals: true});
// TODO force use of our own indexes based on phone and callSid
const User = mongoose.model('User', userSchema);

module.exports = User;