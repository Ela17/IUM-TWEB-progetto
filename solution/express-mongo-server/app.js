var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var healthRouter = require("./routes/health");
var chatRouter = require("./routes/chat");
var reviewRouter = require("./routes/reviews");
const standardErrorHandler = require("./middlewares/standardErrorHandler");

var app = express();

app.use(
  cors({
    origin: [process.env.MAIN_SERVER_URL || "http://localhost:3000"],
    credentials: true,
  }),
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", healthRouter);
app.use("/api", chatRouter);
app.use("/api", reviewRouter);

app.use(standardErrorHandler);

module.exports = app;
