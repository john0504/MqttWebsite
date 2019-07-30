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
        mysqlQuery('SELECT * FROM TempTbl ', function (err, serials) {
            if (err) {
                console.log(err);
            }
            var data = serials;
            mysqlQuery('SELECT * FROM AllowTbl ', function (err, allows) {
                if (err) {
                    console.log(err);
                }
                // use payment.ejs
                var allow = allows;
                res.render('serial', { title: 'Serial Information', data: data, allow: allow });
            });
        });
    } else {
        res.redirect('/serial');
    }
});

// add page
router.get('/add', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    res.render('serialAdd', { title: 'Add Serial', msg: '' });
});

// add post
router.post('/serialAdd', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = req.body.DevNo;
    var dateStr = req.body.ExpireDate;
    var DevNoArr = DevNo.toString().split(',');
    var year = dateStr.substring(0, 4);
    var month = dateStr.substring(4, 6);
    var day = dateStr.substring(6, 8);
    var date = new Date(year, month - 1, day, 0, 0, 0);
    var ExpireDate = date.getTime() / 1000;
    var mysqlQuery = req.mysqlQuery;
    if (DevNoArr.length == 0) {
        res.redirect('/serial');
        return;
    }
    DevNoArr.forEach(devNo => {
        if (devNo.trim().length == 12) {
            var sql = {
                DevNo: devNo.trim(),
                ExpireDate: ExpireDate
            };
            mysqlQuery('INSERT IGNORE INTO TempTbl SET ?', sql, function (err, rows) {
                if (err) {
                    console.log(err);
                }
                if (DevNoArr[DevNoArr.length - 1].toString() == devNo.toString()) {
                    res.redirect('/serial');
                    return;
                }
            });
        } else {
            if (DevNoArr[DevNoArr.length - 1] == devNo) {
                res.redirect('/serial');
                return;
            }
        }
    });
});

router.get('/move', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('INSERT IGNORE INTO AllowTbl(DevNo,ExpireDate) SELECT DevNo,ExpireDate FROM TempTbl', function (err, rows) {
        if (err) {
            console.log(err);
        }
        mysqlQuery('TRUNCATE TABLE TempTbl', function (err, rows) {
            if (err) {
                console.log(err);
            }

            res.redirect('/serial');
        });
    });
});

router.get('/serialDelete', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = req.query.DevNo;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('DELETE FROM TempTbl WHERE DevNo = ?', DevNo, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/serial');
    });
});

module.exports = router;
