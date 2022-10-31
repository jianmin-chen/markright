const express = require("express");
const router = express.Router();

router.post("/signup", (req, res, next) => {
    return res.redirect("/");
});

module.exports = router;
