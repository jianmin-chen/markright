const config = require("../config");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const auth = require("../utils/auth");
const router = express.Router();

const Users = mongoose.models.user;

router.post("/signup", async (req, res, next) => {
    // TODO: Add error messages
    const { email, password } = req.body;
    if (!email || !password || (await Users.findOne({ email })))
        return res.redirect("/account");

    // Sign user up
    const finalUser = new Users({ email, password });
    finalUser.setPassword(password);
    finalUser.save();

    const tokenInfo = finalUser.toAuthJSON();
    const token = jwt.sign(tokenInfo, config.JWT_SECRET, { expiresIn: 604800 });

    req.session.token = token;

    return res.redirect("/");
});

router.post("/login", async (req, res, next) => {
    // TODO: Add error messages
    const { email, password } = req.body;
    if (!email || !password) return res.redirect("/account");

    const user = await Users.findOne({ email });
    if (!user) return res.redirect("/account");

    const valid = user.validatePassword(password);
    if (!valid) return res.redirect("/account");

    // If email and password are valid, set token
    const tokenInfo = user.toAuthJSON();
    const token = jwt.sign(tokenInfo, config.JWT_SECRET, { expiresIn: 604800 });

    req.session.token = token;

    return res.redirect("/");
});

router.get("/loggedIn", auth, (req, res, next) => {
    return res.status(200).json({ loggedIn: req.session.token && req.userId });
});

router.get("/logout", (req, res, next) => {
    req.session = null;
    res.clearCookie("markright-active");
    res.clearCookie("markright-open-folders");
    return res.redirect("/");
});

module.exports = router;
