'use strict'

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');

//connect to db
mongoose.connect(config.database);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('db connected')
});


//middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true
  }
}));

app.use(expressValidator());

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});



//view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//static
app.use(express.static(path.join(__dirname, 'public')));

//globals
app.locals.errors = null;

//routes
const pages = require('./routes/pages');
const adminPages = require('./routes/admin_pages');

app.use('/admin', adminPages);
app.use('/', pages);

//port
const port = 3000;
app.listen(port, (err) => {
  if (err) {
    console.log('server error', err)
  }

  console.log('up on 3000');
});