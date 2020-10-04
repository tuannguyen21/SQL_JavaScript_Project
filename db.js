var mysql = require('mysql');
var dbconfig = require('./dbconfig.json');
var db;

function connectDatabase() {
    if (!db) {
        db = mysql.createConnection(dbconfig);
        db.connect(function (err) {
            if (err) throw err;
            console.log("db.js: Connected to MySQL server.");
        });
    }
    return db;
}

module.exports = connectDatabase();