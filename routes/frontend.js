const express = require("express");
const passport = require("passport");
const path = require("path");
const router = express.Router();
const auth = require("../utils/auth");
const getTokenFromHeaders = require("../utils/getTokenFromHeaders");

router.get("/", auth.optional, (req, res, next) => {
    if (getTokenFromHeaders(req)) {
        // Determine if user is already logged in
        return passport.authenticate(
            "local",
            { session: false },
            (err, passportUser, info) => {
                if (err)
                    // Invalid token
                    return res.sendFile(
                        path.join(__dirname, "..", "views", "index.html")
                    );
                else if (passportUser) return res.redirect("/app"); // Logged in
                return res.status(400).send(info);
            }
        )(req, res, next);
    }

    return res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/account", auth.optional, (req, res, next) => {
    if (getTokenFromHeaders(req)) {
        // Determine if user is already logged in
        return passport.authenticate(
            "local",
            { session: false },
            (err, passportUser, info) => {
                if (err)
                    // Invalid token
                    return res.sendFile(
                        path.join(__dirname, "..", "views", "index.html")
                    );
                else if (passportUser) return res.redirect("/app"); // Logged in
                return res.status(400).send(info);
            }
        )(req, res, next);
    }

    return res.sendFile(path.join(__dirname, "..", "views", "account.html"));
});

router.get("/app", auth.optional, (req, res, next) => {
    return res.sendFile(path.join(__dirname, "..", "views", "editor.html"));
});

module.exports = router;
