const express = require("express");
const router = express.Router();

router.use("/", require("./frontend"));
router.use("/", require("./account"));
router.use("/api", require("./editor"));

module.exports = router;
