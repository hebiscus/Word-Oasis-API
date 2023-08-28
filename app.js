const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const logger = require('morgan');
var cors = require('cors');
require('dotenv').config();
require('./middleware/passport');
const passport = require('passport');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/adminRoute');

(async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to mongodb!");
  } catch(err) {
    console.log(err);
  }
})();

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
