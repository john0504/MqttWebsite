var express = require('express');
var router = express.Router();

// home page
function checkSession(req, res) {
    if (!req.session.Sign || !req.session.SuperUser) {
        res.redirect('/');
        return false;
    } else {
        res.locals.Account = req.session.Account;
        res.locals.Name = req.session.Name;
        res.locals.SuperUser = req.session.SuperUser;
    }
    return true;
}

router.get('/', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    if (req.session.SuperUser == 1) {
        mysqlQuery('SELECT * FROM PaymentTbl ', function (err, payments) {
            if (err) {
                console.log(err);
            }
            var data = payments;

            // use payment.ejs
            res.render('payment', { title: 'Payment Information', data: data });
        });
    } else {
        res.redirect('/payment');
    }
});

// add page
router.get('/add', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    res.render('paymentAdd', { title: 'Add Payment', msg: '' });
});

// add post
router.post('/paymentAdd', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    // check Account exist
    var CardNo = req.body.CardNo;
    mysqlQuery('SELECT * FROM PaymentTbl WHERE CardNo = ?', CardNo, function (err, payments) {
        if (err) {
            console.log(err);
        }

        var count = payments.length;
        if (count > 0) {

            var msg = 'CardNo already exists.';
            res.render('paymentAdd', { title: 'Add Payment', msg: msg });

        } else {

            var sql = {
                CardNo: CardNo,
                Used: 0,
            };

            //console.log(sql);
            mysqlQuery('INSERT INTO PaymentTbl SET ?', sql, function (err, rows) {
                if (err) {
                    console.log(err);
                }
                res.redirect('/payment');
            });
        }
    });
});


router.get('/paymentDelete', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var CardNo = req.query.CardNo;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('DELETE FROM PaymentTbl WHERE CardNo = ?', CardNo, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/payment');
    });
});

module.exports = router;
