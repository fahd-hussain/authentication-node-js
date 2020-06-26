var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema(
    {
        firstname: {
            type: String,
            required: true,
            unique: false,
            maxlength: 30,
        },
        lastname: {
            type: String,
            required: true,
            unique: false,
            maxlength: 30,
        },
        gender: {
            type: String,
            required: true,
            unique: false,
            maxlength: 6,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        admin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
