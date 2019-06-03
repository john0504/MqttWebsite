var express = require('express'),
    router = express.Router();


router.get('/', function(req, res, next) {
    if (req.session.sign) {
        res.locals.account = req.session.name;
        res.redirect('/machine');
    }
    res.redirect('/login');
});

module.exports = router;