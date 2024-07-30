const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
const config = require("config");
const testMiddleware = require("./middlewares/index");

// Import routes
const indexRouter = require("./routes/index");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

require("dotenv").config();
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(testMiddleware);

// Routes
app.use("/", indexRouter);
app.use("/api", applicationRoutes);

module.exports = app;
