var express = require('express');
var router = express.Router();

var searchRouter = require('./search');
var checkoutRouter = require('./checkout');
var checkinRouter = require('./checkin');
var borrowerRouter = require('./borrower');
var finesRouter = require('./fines');

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Database Project' });
});
router.use('/search', searchRouter);
router.use('/checkout', checkoutRouter);
router.use('/checkin', checkinRouter);
router.use('/borrower', borrowerRouter);
router.use('/fines', finesRouter);

module.exports = router;
