var express = require('express');
var router = express.Router();

// homepage
router.get('/', function(req, res, next) {
  res.json();
});

module.exports = router;
