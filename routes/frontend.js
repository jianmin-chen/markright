const config = require("../config");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const auth = require("../utils/auth");
const router = express.Router();

const Users = mongoose.models.user;

router.get("/", auth, (req, res, next) => {
    if (req.session.token && req.userEmail) return res.redirect("/app");
    return res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/account", auth, (req, res, next) => {
    if (req.session.token && req.userEmail) return res.redirect("/app");
    return res.sendFile(path.join(__dirname, "..", "views", "account.html"));
});

router.get("/app", auth, async (req, res, next) => {
    if (!req.session.token || !req.userEmail) return res.redirect("/account");
    return res.sendFile(path.join(__dirname, "..", "views", "editor.html"));
});

module.exports = router;
