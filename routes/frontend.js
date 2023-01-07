const config = require("../config");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const auth = require("../utils/auth");
const router = express.Router();

const Users = mongoose.models.user;

router.get("/", auth, (req, res, next) => {
    if (req.session.token && req.userId) return res.redirect("/app");
    return res.render("index");
});

router.get("/account", auth, (req, res, next) => {
    if (req.session.token && req.userId) return res.redirect("/app");
    return res.render("account");
});

router.get("/app", auth, async (req, res, next) => {
    if (!req.session.token || !req.userId) return res.redirect("/account");
    return res.render("editor");
});

module.exports = router;
