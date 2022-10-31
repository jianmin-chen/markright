const config = require("../../config");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: String,
    hash: String,
    salt: String,
    folder: String
});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
        .toString("hex");
};

userSchema.methods.validatePassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
        .toString("hex");
    return this.hash === hash;
};

userSchema.methods.generateJWT = function () {
    const today = new Date();
    const expiration = new Date(today);
    expiration.setDate(today.getDate() + 60);

    return jwt.sign(
        {
            email: this.email,
            id: this._id,
            expires: parseInt(expiration.getTime() / 1000, 10)
        },
        config.PASSPORT_SECRET
    );
};

userSchema.methods.toAuthJSON = function () {
    return {
        _id: this._id,
        email: this.email,
        token: this.generateJWT()
    };
};

userSchema.pre("save", function (next) {
    if (this.isNew) {
        // Create AWS bucket for user, if user is new
    }

    next();
});

module.exports = mongoose.models.user || mongoose.model("user", userSchema);
