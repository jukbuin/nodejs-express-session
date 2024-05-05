const express = require('express');
const app = express();
var fs = require('fs');
var bodyParser = require('body-parser')
const compression = require('compression');
var helmet = require('helmet');
app.use(helmet());
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var flash = require('connect-flash');
var db = require('./lib/db');


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));

app.use(flash());


var passport = require('./lib/passport')(app);


app.get('*', function (req, res, next) {
    req.list = db.get('topics').value();
    next();
});

var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth')(passport);

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use(function (req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(3000, () => console.log('Example app listening on port 3000'));

