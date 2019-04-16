(function() {
  "use strict";

  var express = require("express");
  var path = require("path");
  var logger = require("morgan");
  var cookieParser = require("cookie-parser");
  var bodyParser = require("body-parser");
  const passport = require("passport");
  const session = require("express-session");

  // Set up mongoose connection
  var mongoose = require("mongoose");
  var dev_db_url =
    "mongodb+srv://gymdb:password21@gymdb-paqxb.mongodb.net/test?retryWrites=true";
  var mongoDB = process.env.MONGODB_URI || dev_db_url;
  mongoose.connect(mongoDB, { useNewUrlParser: true });
  mongoose.Promise = global.Promise;
  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));

  var indexRouter = require("./routes/index");
  var catalogRouter = require("./routes/catalog");
  var usersRouter = require('./routes/users');

  var app = express();

  // Passport Config
  require("./config/passport")(passport);

  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: false
    })
  );

  app.use(cookieParser());
  var port = 3000;
  app.set("port", port);

  // Express session
  app.use(
    session({
      secret: "secret",
      resave: true,
      saveUninitialized: true
    })
  );
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // point for static assets
  app.use(express.static(path.join(__dirname, "public")));

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");

  app.use("/", indexRouter);
  app.use('/users', usersRouter);
  app.use("/catalog", catalogRouter);

  var server = app.listen(port, function() {
    console.log("Express server listening on port " + server.address().port);
  });

  
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  module.exports = app;
})();
