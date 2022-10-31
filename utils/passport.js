const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Users = mongoose.model("user");

passport.use(
    new LocalStrategy(
        {
            usernameField: "user[email]",
            passwordField: "user[password]"
        },
        (email, password, done) => {
            Users.findOne({ email })
                .then(user => {
                    if (!user || !user.validatePassword(password))
                        return done(null, false, {
                            errors: {
                                code: 401
                            }
                        });

                    return done(null, user);
                })
                .catch(done);
        }
    )
);
