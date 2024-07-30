const express = require("express");
const path = require('path');
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require('morgan');
const config = require('config');
const indexRouter = require('./routes/index');
const testMiddleware = require('./middlewares/index');

const app = express();


require("dotenv").config();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(testMiddleware);
app.use('/', indexRouter);


module.exports = app;