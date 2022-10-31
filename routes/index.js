const express = require("express");
const router = express.Router();

router.use("/", require("./frontend"));
router.use("/", require("./account"));

module.exports = router;
