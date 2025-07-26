var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var standardErrorHandler = require("./middlewares/errorHandler");

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

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

/*
 * Questo middleware viene eseguito se nessuna rotta precedente
 * ha gestito la richiesta (risulta in un 404), poi inoltra
 * l'errore all'handler generale.
 */
app.use(function (req, res, next) {
  next(
    standardErrorHandler.createError
      ? standardErrorHandler.createError(404)
      : new Error("Not Found", { cause: { status: 404 } }),
  );
});

app.use(standardErrorHandler);

module.exports = app;
