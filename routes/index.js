var express = require('express'),
    router = express.Router();


router.get('/', function (req, res, next) {
    if (req.session.Sign) {
        res.locals.Account = req.session.Account;
        res.locals.Name = req.session.Name;
        res.redirect('/machine');
    }
    res.redirect('/login');
});

module.exports = router;