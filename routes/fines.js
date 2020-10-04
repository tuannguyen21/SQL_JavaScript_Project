var express = require('express');
var router = express.Router();

var db = require('../db.js');

// Processes GET requests from the search GUI
// Receive the cardid parameter at: req.query.cardid, need to be validated
router.get('/', function(req, res, next) {
	if (!req.query.cardid) {
		res.render('fines', { title: 'Fines' });
	}
	else if (true) {
		// Update the fines associated with the Card_id given
		// Get input
		let sql = "UPDATE FINES INNER JOIN BOOK_LOANS ON fines.Loan_id = BOOK_LOANS.Loan_id " +
			"SET Paid = 1 " +
			"WHERE Card_id = " + db.escape(req.query.cardid) + ";";
		// Query database
		db.query(sql, function(err, result, fields) {
			// Update fail
			if (err) {
				res.render('fines', { title: 'Fines', cardid: req.query.cardid, finesCompleted: 0 });
			}
			// Update success
			else {
				res.render('fines', { title: 'Fines', cardid: req.query.cardid, finesCompleted: 1 });
			}
		});
	}
	else {
		res.redirect('/fines');
	}
});

// Receive user POST data and render search results while keeping search bar OR update all fines in the system
// Received input variable: finesUpdate OR finesInput, finesInputPaid
router.post('/', function(req, res, next) {
	if (req.body.finesUpdate) {
		// Update all fines in the system
		let sql = "INSERT INTO FINES " +
			"(SELECT Loan_id, CASE WHEN Date_in IS NULL THEN (DATEDIFF(CURRENT_DATE(), Due_date)*0.25) " +
			"ELSE (DATEDIFF(Date_in, Due_date)*0.25) END AS Fine_amt, 0 AS Paid " +
			"FROM BOOK_LOANS WHERE Loan_id NOT IN (SELECT Loan_id FROM FINES WHERE Paid = 1) AND Due_date < CURRENT_DATE()) " +
			"ON DUPLICATE KEY UPDATE " +
			"Fine_amt = (CASE WHEN BOOK_LOANS.Date_in IS NULL THEN (DATEDIFF(CURRENT_DATE(), BOOK_LOANS.Due_date)*0.25) ELSE (DATEDIFF(BOOK_LOANS.Date_in, BOOK_LOANS.Due_date)*0.25) END), " +
			"Paid = 0;";
		db.query(sql, function(err, result, fields) {
			if (err) {
				res.render('fines', { title: 'Fines', updateError: 1 });
			}
			else {
				console.log(result);
				res.render('fines', { title: 'Fines', updateResult: 1 });
			}
		});
	}
	else if (req.body.finesInput) {
		// Search for fines in the system
		let sql = "SELECT BOOK_LOANS.Card_id, SUM(FINES.Fine_amt) AS Fine_amt, FINES.Paid FROM FINES JOIN BOOK_LOANS ON FINES.Loan_id = BOOK_LOANS.Loan_id WHERE BOOK_LOANS.Date_in IS NOT NULL ";
		if (req.body.finesInputPaid) { sql += "AND fines.Paid = False "; }
		sql += "GROUP BY BOOK_LOANS.Card_id, FINES.Paid;";
		// Query database
		db.query(sql, function (err, result, fields) {
			if (err) throw err;
			res.render('fines', { title: 'Fines', finesData: result });
		});
	}
	else {
		res.render('fines', { title: 'Fines' });
	}
});

module.exports = router;
