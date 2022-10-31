const config = require("./config");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorHandler = require("errorhandler");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");

// Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

const app = express();

// Configure middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: config.PASSPORT_SECRET,
        cookie: { maxAge: config.PASSPORT_MAXAGE },
        resave: false,
        saveUninitialized: false
    })
);

// Configure Mongoose
mongoose.connect(config.MONGODB_URI);

if (!config.NODE_ENV === "production") {
    // In development mode
    app.use(require("morgan")("dev"));
    app.use(errorHandler());
    mongoose.set("debug", true);
}

// Require models & routes
require("./database/models/user");
require("./utils/passport");

app.use(require("./routes"));

app.listen(config.PORT, () => {
    if (!(config.NODE_ENV === "production"))
        console.log(`Server running on port ${config.PORT}`);
});
