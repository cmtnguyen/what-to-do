const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
});

userSchema.plugin(passportLocalMongoose); //adds password and user field
module.exports = mongoose.model('User', userSchema);
