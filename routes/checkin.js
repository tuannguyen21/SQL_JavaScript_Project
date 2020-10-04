var express = require('express');
var router = express.Router();

var db = require('../db.js');

// Processes GET requests from the search GUI
// Receive the loanid parameter at: req.query.loanid, need to be validated
router.get('/', function(req, res, next) {
	if (!req.query.loanid || !req.query.isbn) {
		res.render('checkin', { title: 'Checkin' });
	}
	else if (req.query.isbn.length == 10) {
		// Validate if book has already been checked in or not
		let sql = "SELECT Loan_id, ISBN, Date_in FROM BOOK_LOANS " +
		"WHERE Loan_id = " + db.escape(req.query.loanid) + " AND ISBN = " + db.escape(req.query.isbn) + ";";
		db.query(sql, function(err, result, fields) {
			if (err || !result[0] || result[0] == undefined || (!result[0].Loan_id) || (result[0].Date_in != null)) {
				res.render('checkin', { title: 'Checkin', loanid: req.query.loanid, isbn: req.query.isbn, checkinCompleted: 0 });
			}
			else {
				// Check in the book with the Loan_id and ISBN given
				// Get input
				sql = "UPDATE BOOK_LOANS " +
					"SET Date_in = CURRENT_DATE " +
					"WHERE Loan_id = " + db.escape(req.query.loanid) + " AND ISBN = " + db.escape(req.query.isbn) + ";";
				// Query database
				db.query(sql, function(err, result, fields) {
					// Checkin fail
					if (err) {
						res.render('checkin', { title: 'Checkin', loanid: req.query.loanid, isbn: req.query.isbn, checkinCompleted: 0 });
					}
					// Checkin success
					else {
						res.render('checkin', { title: 'Checkin', loanid: req.query.loanid, isbn: req.query.isbn, checkinCompleted: 1 });
					}
				});
			}
		});
	}
	else {
		res.redirect('/checkin');
	}
});

// Receive user POST data and render search results while keeping search bar
// Received input variable: checkinInput, retrieve at req.body.checkinInput
router.post('/', function(req, res, next) {
	// Get input
	let input = "%" + req.body.checkinInput + "%";
	let sql = "SELECT BOOK_LOANS.Loan_id, BOOK.ISBN, BOOK.Title, BORROWER.Bname FROM BOOK " +
		"INNER JOIN BOOK_LOANS ON BOOK.ISBN = BOOK_LOANS.ISBN " +
		"INNER JOIN BORROWER ON BOOK_LOANS.Card_id = BORROWER.Card_id " +
		"WHERE BOOK_LOANS.Date_in IS NULL AND (BOOK.ISBN LIKE " + db.escape(input) + " " +
		"OR BORROWER.Card_id LIKE " + db.escape(input) + " " +
		"OR BORROWER.Bname LIKE " + db.escape(input) + ") ORDER BY BOOK.ISBN;";
	// Query database
	db.query(sql, function(err, result, fields) {
		if (err) throw err;
		res.render('checkin', { title: 'Checkin', checkinData: result });
	});
});

module.exports = router;
