const template = require("../lib/template");
const fs = require("fs");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const express = require("express");
var router = express.Router();
var auth = require('../lib/auth');
var db = require('../lib/db');
var shortid = require('shortid');

router.get('/create', (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect('/');
        return false;
    }
    var title = 'WEB - create';
    var list = template.list(req.list);
    var html = template.HTML(title, list, `
          <form action="/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
        `, '', auth.statusUI(req, res));
    res.send(html);
});

router.post('/create_process', (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect('/');
        return false;
    }
    var post = req.body;
    var title = post.title;
    var description = post.description;
    var id = shortid.generate();
    db.get('topics').push({
        id: id,
        title: title,
        description: description,
        user_id: req.user.id
    }).write();
    res.redirect(`/topic/${id}`);
});

router.get('/update/:pageId', (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect('/');
        return false;
    }
    var topic = db.get('topics').find({id: req.params.pageId}).value();
    if (topic.user_id !== req.user.id) {
        // req.flash('Not yours!');
        return res.redirect('/');
    }
    var title = topic.title;
    var description = topic.description;
    var list = template.list(req.list);
    var html = template.HTML(title, list,
        `
            <form action="/topic/update_process" method="post">
              <input type="hidden" name="id" value="${topic.id}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
        `<a href="/topic/create">create</a> <a href="/topic/update/${topic.id}">update</a>`, auth.statusUI(req, res)
    );
    res.send(html);
});

router.post('/update_process', (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect('/');
        return false;
    }
    var post = req.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    var topic = db.get('topics').find({id: id}).value();
    if (topic.user_id !== req.user.id) {
        // req.flash('Not yours!');
        return res.redirect('/');
    }
    db.get('topics').find({id: id}).assign({title: title, description: description}).write();
    res.redirect(`/topic/${topic.id}`);
});

router.post('/delete_process', (req, res) => {
    if (!auth.isOwner(req, res)) {
        res.redirect('/');
        return false;
    }
    var post = req.body;
    var id = post.id;
    var topic = db.get('topics').find({id: id}).value();
    if (topic.user_id !== req.user.id) {
        return res.redirect('/');
    }
    db.get('topics').remove({id:id}).write();
    res.redirect('/');
});

router.get('/:pageId', (req, res, next) => {
    var topic = db.get('topics').find({id: req.params.pageId}).value();
    var user = db.get('users').find({id: topic.user_id}).value();
    var sanitizedTitle = sanitizeHtml(topic.title);
    var sanitizedDescription = sanitizeHtml(topic.description, {
        allowedTags: ['h1']
    });
    var list = template.list(req.list);
    var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}<p>by ${user.displayName}</p>`,
        ` <a href="/topic/create">create</a>
                <a href="/topic/update/${topic.id}">update</a>
                <form action="/topic/delete_process" method="post">
                  <input type="hidden" name="id" value="${topic.id}">
                  <input type="submit" value="delete">
                </form>`,
        auth.statusUI(req, res)
    );
    res.send(html);

});

module.exports = router;