const express = require("express");
const config = require("config");
require("dotenv").config();
require("express-async-errors");
const checkDatabaseConnection = require("./startup/checkDatabaseConnection");
const errorHandler = require("./middlewares/errorMiddleware");
const session = require("express-session");
const passport = require("./config/passport");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");

const testMiddleware = require("./middlewares/index");

// Import routes
const indexRouter = require("./routes/index");
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/auth");
const connectionRoutes = require("./routes/connectionRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const auditRoutes = require("./routes/auditRoutes");
const traceIdMiddleware = require("./middlewares/traceIdMiddleware");

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret", //custom env variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(testMiddleware);
app.use(traceIdMiddleware);

// Routes
app.use("/", indexRouter);

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-trails", auditRoutes);



// Error handling middleware
app.use(errorHandler);

const startServer = async () => {
  const dbConnected = await checkDatabaseConnection();

  if (!dbConnected) {
    logger.error("Failed to connect to the database. Exiting...");
    process.exit(1); // Exit the application with failure
  }
};

startServer();

module.exports = app;
