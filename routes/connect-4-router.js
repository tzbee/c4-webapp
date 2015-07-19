var express = require('express');
var router = express.Router();

/* GET single page app. */
router.get('/', function(req, res) {
	res.render('index', {
		title: 'Connect 4'
	});
});

module.exports = router;