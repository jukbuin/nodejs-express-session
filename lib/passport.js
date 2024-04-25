const passport = require("passport");
const {Strategy: LocalStrategy} = require("passport-local");

module.exports = function (app) {

    var authData = {
        email: 'h04095@naver.com',
        password: '111111',
        nickname: 'jukbuin'
    };

    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser(function (user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function (id, done) {
        done(null, authData);
    });

    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'pwd'
        },
        function (username, password, done) {
            if (username === authData.email) {
                if (password === authData.password) {
                    return done(null, authData, {
                        message: 'Welcome!'
                    });
                } else {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
            } else {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
        }));
    return passport;
}
