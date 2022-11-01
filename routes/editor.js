const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { content, upload }  = require("../database/aws/aws");
const auth = require("../utils/auth");

const Users = mongoose.models.user;

router.get("/getFiles", auth, async (req, res, next) => {
    if (!req.session.token || !req.userId) return res.status(400);

    // Find user in database
    let user = await Users.findOne({ _id: req.userId });
    if (!user) return res.status(400);
    return res.status(200).send(await content(user.filesystem));
});

router.post("/updateFilesystem", auth, async (req, res, next) => {
    if (!req.session.token || !req.userId || !req.body.filesystem) return res.status(400);

    // Find user in database
    let user = await Users.findOne({ _id: req.userId });
    if (!user) return res.status(400);
    upload(user.filesystem, req.body.filesystem);
    return res.status(200);
});

module.exports = router;
