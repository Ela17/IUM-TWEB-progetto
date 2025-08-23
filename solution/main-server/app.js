const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const {
  corsConfig,
  morganConfig,
  jsonConfig,
  urlencodedConfig,
} = require("./config");

const indexRouter = require("./routes/index");
const healthRouter = require("./routes/health");
const moviesRouter = require("./routes/movies");
const chatRouter = require("./routes/chat");

const standardErrorHandler = require("./middlewares/standardErrorHandler");

const app = express();

var handlebars = require('handlebars'),
    layouts = require('handlebars-layouts');

app.set("views", path.join(__dirname, "views"));
const { engine } = require("express-handlebars");
handlebars.registerHelper(layouts(handlebars));
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/", indexRouter);      // Pagine HTML -> /, /movies
app.use("/", healthRouter);     // Health check
app.use("/api", moviesRouter);  // API movies
app.use("/api", chatRouter);    // API chat + chat rendering

app.use(function (req, res, next) {
  const error = new Error("Not Found");
  error.status = 404;
  error.statusCode = 404;
  error.code = "NOT_FOUND";
  next(error);
});

app.use(standardErrorHandler);

module.exports = app;
