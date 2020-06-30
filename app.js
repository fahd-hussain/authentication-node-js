// Libraries ---------------------------------------------------------------------------------------//
const express = require("express");
const path = require("path");
const logger = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
require("dotenv").config();
//--------------------------------------------------------------------------------------------------//

// Routes ------------------------------------------------------------------------------------------//
const index = require("./routes/index");
const userRoute = require("./routes/userRoute")
//--------------------------------------------------------------------------------------------------//

// Database ----------------------------------------------------------------------------------------//
mongoose.Promise = require("bluebird");
const url = process.env.DEV_DB_URL;
const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

connect.then(
    (db) => {
        console.log("Connected correctly to server and Database");
    },
    (err) => {
        console.log(err);
    },
);

const app = express();
//--------------------------------------------------------------------------------------------------//

// view engine setup -------------------------------------------------------------------------------//
app.use("/user/profilePicture", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
//--------------------------------------------------------------------------------------------------//

// Logger and Body parser --------------------------------------------------------------------------//
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//--------------------------------------------------------------------------------------------------//

// Passport initializaition ------------------------------------------------------------------------//
app.use(passport.initialize());
//--------------------------------------------------------------------------------------------------//

// User Route --------------------------------------------------------------------------------------//
app.use("/", index);
app.use("/user", userRoute)
//--------------------------------------------------------------------------------------------------//

// catch 404 and forward to error handler ----------------------------------------------------------//
app.use(function (req, res, next) {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});
//--------------------------------------------------------------------------------------------------//

// error handler -----------------------------------------------------------------------------------//
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});
//--------------------------------------------------------------------------------------------------//
module.exports = app;

