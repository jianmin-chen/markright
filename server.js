const config = require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const cors = require("cors");
const errorHandler = require("errorhandler");
const mongoose = require("mongoose");
const path = require("path");

// Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

const app = express();

// Configure middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
    cookieSession({
        name: config.COOKIE_NAME,
        secret: config.COOKIE_SECRET,
        httpOnly: true
    })
);
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

// Configure Mongoose
mongoose.connect(config.MONGODB_URI);

// Require models & routes
require("./database/models/user");

if (!config.NODE_ENV === "production") {
    // In development mode
    app.use(require("morgan")("dev"));
    app.use(errorHandler());
    mongoose.set("debug", true);
}

app.use(require("./routes"));

app.listen(config.PORT, () => {
    if (!(config.NODE_ENV === "production"))
        console.log(`Server running on port ${config.PORT}`);
});
