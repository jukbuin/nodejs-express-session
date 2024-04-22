const template = require("../lib/template");
const express = require("express");
var router = express.Router();

var authData = {
    email: 'h04095@naver.com',
    password: '111111',
    nickname: 'jukbuin'
}

router.get('/login', (req, res) => {
    var title = 'WEB - login';
    var list = template.list(req.list);
    var html = template.HTML(title, list, `
          <form action="/auth/login_process" method="post">
            <p><input type="text" name="email" placeholder="email"></p>
            <p><input type="password" name="password" placeholder="password"></p>
            <p>
              <input type="submit" value="login">
            </p>
          </form>
        `, '');
    res.send(html);
});

router.post('/login_process', (req, res) => {
    var post = req.body;
    var email = post.email;
    var password = post.password;
    if (email === authData.email && password === authData.password) {
        req.session.is_logined = true;
        req.session.nickname = authData.nickname;
        req.session.save(function () {
            res.redirect('/');
        });
    } else {
        res.send('Who?');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

module.exports = router;