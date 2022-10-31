const config = require("../config");
const { expressjwt: jwt } = require("express-jwt");
const getTokenFromHeaders = require("./getTokenFromHeaders");

const auth = {
    required: jwt({
        secret: config.PASSPORT_SECRET,
        userProperty: "payload",
        getToken: getTokenFromHeaders,
        algorithms: ["HS256"]
    }),
    optional: jwt({
        secret: config.PASSPORT_SECRET,
        userProperty: "payload",
        getToken: getTokenFromHeaders,
        algorithms: ["HS256"],
        credentialsRequired: false
    })
};

module.exports = auth;
