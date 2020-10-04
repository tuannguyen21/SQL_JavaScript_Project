var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

// Routers
var indexRouter = require('./routes/index');
// Configs
const dbconfig = require('./dbconfig.json');

var app = express();

// Set up SQL connection
var mysql = require('mysql');
var db = require('./db.js');

// Initialize database, only need to do once

var sql = fs.readFileSync('./sqldata/library_init.sql').toString();
db.query(sql, function(err, result) {
	if (err) throw err;
	console.log("app.js: Done initializing database.");
});


// Change current database to Library
db.query("USE Library;", function(err, result) {
	if (err) throw err;
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
	// Set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// Render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
