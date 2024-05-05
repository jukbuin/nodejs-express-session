const template = require("../lib/template");
const express = require("express");
const auth = require("../lib/auth");
const fs = require("fs");
var router = express.Router();
var shortid = require('shortid');
var db = require('../lib/db');
var bcrypt = require('bcrypt');

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
    });

    router.get('/register', (req, res) => {
        var feedback = req.flash('error');
        var title = 'WEB - login';
        var list = template.list(req.list);
        var html = template.HTML(title, list, `
          <div style="color: red;">${feedback}</div>
          <form action="/auth/register_process" method="post">
            <p><input type="text" name="email" placeholder="email" value="a1234@naver.com"></p>
            <p><input type="password" name="pwd" placeholder="password" value="111111"></p>
            <p><input type="password" name="pwd2" placeholder="password" value="111111"></p>
            <p><input type="text" name="displayName" placeholder="display name" value="a1234"></p>
            <p>
              <input type="submit" value="register">
            </p>
          </form>
        `, '');
        res.send(html);
    });

    router.post('/register_process', (req, res) => {
        var post = req.body;
        var email = post.email;
        var pwd = post.pwd;
        var pwd2 = post.pwd2;
        var displayName = post.displayName;
        if (pwd !== pwd2) {
            req.flash('error', 'Password must same!');
            req.session.save(() => {
                res.redirect('/auth/register');
            });
        } else {
            bcrypt.hash(pwd, 10, function(err, hash) {
                var user = {
                    id: shortid.generate(),
                    email: email,
                    password: hash,
                    displayName: displayName
                };
                db.get('users').push(user).write();
                req.login(user, function (err) {
                    return res.redirect('/');
                });
            });
        }
    });

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


