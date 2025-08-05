var express = require("express");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const {
  corsConfig,
  morganConfig,
  jsonConfig,
  urlencodedConfig,
} = require("./config");

var healthRouter = require("./routes/health");
var moviesRouter = require("./routes/movies");
var chatRouter = require("./routes/chat");

var standardErrorHandler = require("./middlewares/standardErrorHandler");

var app = express();

app.set("views", path.join(__dirname, "views"));
const { engine } = require("express-handlebars");
app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "layout",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
  }),
);
app.set("view engine", "hbs");

app.use(logger(morganConfig));
app.use(cors(corsConfig));
app.use(express.json(jsonConfig));
app.use(express.urlencoded(urlencodedConfig));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", healthRouter);
app.use("/api", moviesRouter); // solo dati JSON (REST API)
app.use("/chat", chatRouter); // pagine + WebSocket

app.use(function (req, res, next) {
  const error = new Error("Not Found");
  error.status = 404;
  error.statusCode = 404;
  error.code = "NOT_FOUND";
  next(error);
});

app.use(standardErrorHandler);

module.exports = app;
