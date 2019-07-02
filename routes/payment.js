var express = require('express');
var router = express.Router();

// home page
function checkSession(req, res) {
    if (!req.session.sign || !req.session.superuser) {
        res.redirect('/');
        return false;
    } else {
        res.locals.account = req.session.account;
        res.locals.name = req.session.name;
        res.locals.superuser = req.session.superuser;
    }
    return true;
}

router.get('/', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    if (req.session.superuser == 1) {
        mysqlQuery('SELECT * FROM mqtt_payment ', function (err, rows) {
            if (err) {
                console.log(err);
            }
            var data = rows;

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

    // check account exist
    var code = req.body.code;
    mysqlQuery('SELECT code FROM mqtt_payment WHERE code = ?', code, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {

            var msg = 'Code already exists.';
            res.render('paymentAdd', { title: 'Add Payment', msg: msg });

        } else {

            var sql = {
                code: req.body.code,
                used: 0,
                createdate: Date.now()
            };

            //console.log(sql);
            mysqlQuery('INSERT INTO mqtt_payment SET ?', sql, function (err, rows) {
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
    var id = req.query.id;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('DELETE FROM mqtt_payment WHERE id = ?', id, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/payment');
    });
});

module.exports = router;
