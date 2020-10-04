var express = require('express');
var router = express.Router();

var db = require('../db.js');

router.get('/', function(req, res, next) {
	res.render('borrower', { title: 'Borrower Management' });
});

// Receive user POST data and render result
// Received input variables: borrowerName, borrowerSSN and borrowerAddress from req.body
router.post('/', function(req, res, next) {
	// Get inputs
	if (!req.body.borrowerName || !req.body.borrowerSSN || !req.body.borrowerAddress) {
		res.render('borrower', { title: 'Borrower Management' });		
	}
	else {
		let sql = "SELECT * FROM BORROWER WHERE SSN = " + db.escape(req.body.borrowerSSN) + ";";
		// Error when the same SSN is already presented in the database
		db.query(sql, function(err, result, fields) {
			if (err) {
				res.render('borrower', { title: 'Borrower Management', error: 3 });
			}
			else {
				// Same SSN is in the database
				if (result.length > 0) {
					res.render('borrower', { title: 'Borrower Management', error: 1 });
				}
				else {
					// Insert new borrower into database
					sql = "SELECT MAX(card_id)+1 AS roof FROM BORROWER;";
					db.query(sql, function(err, result, fields) {
						if (err || !result[0] || result[0] == undefined) {
							res.render('borrower', { title: 'Borrower Management', error: 3 })
						}
						else {
							let newID = result[0].roof;
							sql = "INSERT INTO BORROWER VALUES ('" + newID + "', " + db.escape(req.body.borrowerSSN) + ", " + db.escape(req.body.borrowerName) + ", " + db.escape(req.body.borrowerAddress) + ", ";
							if (!req.body.borrowerPhone) { sql += "NULL);"; }
							else {
								sql += db.escape(req.body.borrowerPhone);
								sql += ");";
							}
							db.query(sql, function(err, result, fields) {
								if (err) {
									res.render('borrower', { title: 'Borrower Management', error: 3 });
								}
								else {
									res.render('borrower', { title: 'Borrower Management', result: 1 });
								}
							});
						}
					});
				}
			}
		});
	}
});

module.exports = router;
