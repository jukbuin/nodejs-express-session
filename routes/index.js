var express = require('express');
const template = require("../lib/template");
var auth = require('../lib/auth');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {

    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(req.list);
    var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}
               <img src="/images/hello.jpg" alt="hello" style="width:300px; display: block; margin-top: 10px;">
               `,
        `<a href="/topic/create">create</a>`,
        auth.statusUI(req, res)
    );
    res.send(html);
});

module.exports = router;
