const express = require("express");
const config = require("config");
require("dotenv").config();
const session = require("express-session");
const passport = require("./config/passport");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");

const testMiddleware = require("./middlewares/index");
const errorHandler = require("./middlewares/errorMiddleware"); // Your custom error handler

// Import routes
const indexRouter = require("./routes/index");
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/auth");
const connectionRoutes = require("./routes/connectionRoutes"); // Import connection routes

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Ensure cookies are secure in production
  })
);

app.use((req, res, next) => {
  console.log("Request Session:", req.session);
  next();
});

app.use(passport.initialize());

app.use(passport.session());

app.use(testMiddleware);

// Routes
app.use("/", indexRouter);
app.use("/api", applicationRoutes);
app.use("/api", connectionRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;
