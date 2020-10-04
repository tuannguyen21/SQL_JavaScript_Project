var express = require('express');
var router = express.Router();

var db = require('../db.js');

router.get('/', function(req, res, next) {
	res.render('search', { title: 'Search' });
});

// Receive user POST data and render search results while keeping search bar
// Received input variable: searchInput, retrieve at req.body.searchInput
router.post('/', function(req, res, next) {
	// Get input
	let input = "%" + req.body.searchInput + "%";
	let sql = "SELECT T.ISBN, T.Title, GROUP_CONCAT(T.Name SEPARATOR ', ') AS Name, T.Availability FROM (SELECT BOOK.ISBN, BOOK.Title, AUTHORS.Name, CASE WHEN t.ISBN IS NULL THEN 'No' ELSE 'Yes' END AS Availability FROM BOOK " +
		"INNER JOIN BOOK_AUTHORS ON BOOK.ISBN = BOOK_AUTHORS.ISBN " +
		"INNER JOIN AUTHORS ON BOOK_AUTHORS.Author_id = AUTHORS.Author_id " +
		"LEFT JOIN (SELECT * FROM BOOK WHERE BOOK.ISBN NOT IN (SELECT ISBN FROM BOOK_LOANS WHERE Date_in IS NULL)) AS t on t.ISBN = BOOK.ISBN " +
		"WHERE BOOK.ISBN LIKE " + db.escape(input) + " " +
		"OR BOOK.Title LIKE " + db.escape(input) + " " +
		"OR AUTHORS.Name LIKE " + db.escape(input) + " ORDER BY BOOK.ISBN) T GROUP BY T.ISBN;";
	// Query database
	db.query(sql, function(err, result, fields) {
		if (err) throw err;
		res.render('search', { title: 'Search', searchData: result });
	});
});

module.exports = router;
