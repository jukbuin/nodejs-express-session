const template = require("../lib/template");
const express = require("express");
var router = express.Router();

module.exports = function (passport) {
    router.get('/login', (req, res) => {
        var fmsg = req.flash();
        var feedback = '';
        if (fmsg.message) {
            feedback = fmsg.message;
        }

        var title = 'WEB - login';
        var list = template.list(req.list);
        var html = template.HTML(title, list, `
          <div style="color: red;">${feedback}</div>
          <form action="/auth/login_process" method="post">
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="password" name="pwd" placeholder="password"></p>
            <p>
              <input type="submit" value="login">
            </p>
          </form>
        `, '');
        res.send(html);
    });

    router.post('/login_process', (req, res, next) => {

        passport.authenticate('local', (err, user, info) => {

            if (req.session.flash) {
                req.session.flash = {}
            }

            req.flash('message', info.message)

            req.session.save(() => {

                if (err) {
                    return next(err)
                }
                if (!user) {
                    return res.redirect('/auth/login')
                }

                req.logIn(user, (err) => {
                    if (err) {
                        return next(err)
                    }
                    req.flash('message', 'Welcome!');
                    return req.session.save(() => {
                        res.redirect('/')
                    })
                })
            })

        })(req, res, next)
    })

    router.get('/logout', (req, res) => {
        req.logout(function (err, next) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
    });

    return router;
}


