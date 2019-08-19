var express = require('express');
var router = express.Router();
var cryptpJS = require('crypto-js');

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
    var CardNoList = "";
    var CardMonth = "";
    res.render('paymentAdd', { title: 'Add Payment', msg: '', CardNoList: CardNoList, CardMonth: CardMonth });
});

// add post
router.post('/paymentAdd', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    // check Account exist
    var CardNo = req.body.CardNo;
    var CardMonth = req.body.CardMonth;
    var CardNoArr = CardNo.toString().split(',');
    CardNoArr.forEach(cardNo => {
        var sql = {
            CardNo: cardNo,
            CardMonth: CardMonth
        };
        mysqlQuery('INSERT IGNORE INTO PaymentTbl SET ?', sql, function (err, rows) {
            if (err) {
                console.log(err);
            }
            if (CardNoArr[CardNoArr.length - 1] == cardNo) {
                res.redirect('/payment');
                return;
            }
        });
    });
});

router.get('/create', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var CardNoList = "";
    var count = req.query.count;
    var months = req.query.month;
    var CardMonth = months;

    var option = {
        mode: cryptpJS.mode.ECB
    };
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var dateStr = `${year}/${month}/${day}`;
    dateStr += `-${hour}:/${minute}/${second}`;
    for (var i = 1; i <= count; i++) {
        var No = i;
        if (i < 10) {
            No = `0000${i}`;
        } else if (i < 100) {
            No = `000${i}`;
        } else if (i < 1000) {
            No = `00${i}`;
        } else if (i < 10000) {
            No = `0${i}`;
        }
        var str = `CECTCO-WAWA-${dateStr}-${No}-${months}`;
        var key = "cEctCoWAwaeNcoDe";
        key = cryptpJS.enc.Utf8.parse(key);
        var encrypted = cryptpJS.AES.encrypt(str, key, option);
        encrypted = encrypted.toString();
        if (CardNoList == "") {
            CardNoList = encrypted;
        } else {
            CardNoList += `,${encrypted}`;
        }
    }
    res.render('paymentAdd', { title: 'Add Payment', msg: '', CardNoList: CardNoList, CardMonth: CardMonth });
});

router.get('/paymentDelete', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var id = req.query.id;

    var mysqlQuery = req.mysqlQuery;

    var sql = {
        id: id
    };
    mysqlQuery('DELETE FROM PaymentTbl WHERE ?', sql, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/payment');
    });
});

module.exports = router;
