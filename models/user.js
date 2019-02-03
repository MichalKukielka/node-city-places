var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: {
        type:String,
        default: '...'    
    },
    first_name: String,
    last_name: String,
    email: String
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);