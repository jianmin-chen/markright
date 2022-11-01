const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("../config");

const Users = mongoose.models.user;

const auth = (req, res, next) => {
    let token = req.session.token;
    if (!token) return next();
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) return next();

        req.userEmail = decoded.email;
        return next();
    });
};

module.exports = auth;
