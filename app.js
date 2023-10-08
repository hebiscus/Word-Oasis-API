const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
var cors = require('cors');
require('dotenv').config();
require('./middleware/passport');
const mongoose = require('mongoose');

const adminRouter = require('./routes/adminRoute');
const blogPostsRouter = require('./routes/blogpostsRoute');

(async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to mongodb!");
  } catch(err) {
    console.log(err);
  }
})();
        
const app = express();

const corsOptions = {
  origin: ['https://word-oasis.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/admin', adminRouter);
app.use('/posts', blogPostsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json('An internal server error occurred when processing your request, please try again or report the issue to site maintainer.');
})



module.exports = app;
