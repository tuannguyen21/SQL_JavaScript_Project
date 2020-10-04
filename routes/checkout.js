var express = require('express');
var router = express.Router();

var db = require('../db.js');

// Processes GET requests from the search GUI
// Receive the isbn parameter at: req.query.isbn, need to be validated
router.get('/', function(req, res, next) {
	if (!req.query.isbn) {
		res.render('checkout', { title: 'Checkout' });
	}
	else if (req.query.isbn.length == 10) {
		res.render('checkout', { title: 'Checkout', isbn: req.query.isbn });
	}
	else {
		res.redirect('/checkout');
	}
});

// Receive user POST data and process borrowing procedures
// Received input variable: cardID at req.body.cardID
router.post('/', function(req, res, next) {
	if (req.query.isbn && req.body.cardID) {
		if (req.body.cardID == undefined) {
			res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID, error: 1 })
		}
		else {
			// Check number of book loans
			let sql = "SELECT COUNT(*) AS Count FROM BOOK_LOANS WHERE Card_id = " + db.escape(req.body.cardID) + " AND Date_in IS NULL;";
			db.query(sql, function(err, result, fields) {
				// Number of book loans is 3
				if (err) {
					res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID, error: 4 });
				}
				else if (result[0].Count == 3) {
					res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID, error: 2 });
				}
				else {
					// Prevent a book from being borrowed multiple times					
					sql = "SELECT Loan_id FROM BOOK_LOANS WHERE ISBN = " + db.escape(req.query.isbn) + " AND Date_in IS NULL;"
					db.query(sql, function(err, result, fields) {
						if (err) {
							res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID, error: 4 });
						}
						else if (result[0] != undefined) {
							res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID, error: 3 });
						}
						else {							
							// Insert transaction and display confirmation
							sql = "SELECT Loan_id FROM BOOK_LOANS ORDER BY Loan_id DESC LIMIT 1";
							db.query(sql, function(err, result, fields) {
								if (err) {
									res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID, error: 4 });
								}
								else {
									let loan_id = 1;
									if (result[0] != undefined) {
										loan_id = parseInt(result[0].Loan_id, 10) + 1;
									}
									sql = "INSERT INTO BOOK_LOANS (Loan_id, ISBN, Card_id, Date_out, Due_date) VALUES (" + db.escape(loan_id) + ", " + db.escape(req.query.isbn) + ", " + db.escape(req.body.cardID) +
									", CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY));";
									db.query(sql, function(err, result, fields) {
										if (err) {
											res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID, error: 4 });
										}
										else {
											res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID });
										}
									});
								}						
							});
						}
					});			
				}					
			});
		}
	}
	else if (req.query.isbn) {
		res.render('checkout', { title: 'Checkout', isbn: req.query.isbn });
	}
	else {
		res.render('checkout', { title: 'Checkout', isbn: req.query.isbn, cardID: req.body.cardID, error: 4 });
	}
});

module.exports = router;
