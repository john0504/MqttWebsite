var express = require('express');
var router = express.Router();
var linePerPage = 10;

// home page
function checkSession(req, res) {
    if (!req.session.Sign) {
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
    var index = parseInt(req.query.index) ? parseInt(req.query.index) : 0;
    if (index < 0) {
        index = 0;
    }
    var mysqlQuery = req.mysqlQuery;
    var SearchAccount = "";
    var sql = 'SELECT count(*) as count from AccountTbl';
    if (req.session.SuperUser == 1) {

    } else if (req.session.SuperUser == 2) {
        sql += ' WHERE SuperUser != 1';
    } else {
        var AccountNo = req.session.AccountNo;
        sql += ` WHERE AccountNo = '${AccountNo}'`
    }
    mysqlQuery(sql, function (err, acc) {
        var total = acc[0].count;
        totalPage = Math.ceil(total / linePerPage);
        if (req.session.SuperUser == 1) {
            sql = 'SELECT * FROM AccountTbl ';
        } else if (req.session.SuperUser == 2) {
            sql = 'SELECT * FROM AccountTbl WHERE SuperUser != 1';
        } else {
            var AccountNo = req.session.AccountNo;
            sql = `SELECT * FROM AccountTbl WHERE AccountNo = '${AccountNo}'`
        }
        sql += (` limit ${index * linePerPage},${linePerPage}`);
        mysqlQuery(sql, function (err, accounts) {
            if (err) {
                console.log(err);
            }
            var data = accounts;

            // use user.ejs
            res.render('user', { title: 'User Information', data: data, SearchAccount: SearchAccount, index: index, totalPage: totalPage, linePerPage: linePerPage });
        });
    });
});

router.get('/search', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var index = parseInt(req.query.index) ? parseInt(req.query.index) : 0;
    if (index < 0) {
        index = 0;
    }
    var SearchAccount = req.query.SearchAccount;
    var mysqlQuery = req.mysqlQuery;

    if (req.session.SuperUser != 0) {
        var sql = `SELECT count(*) as count from AccountTbl WHERE Account LIKE '%${SearchAccount}%'`;
        mysqlQuery(sql, function (err, acc) {
            var total = acc[0].count;
            totalPage = Math.ceil(total / linePerPage);
            sql = `SELECT * FROM AccountTbl WHERE Account LIKE '%${SearchAccount}%'`
            sql += (` limit ${index * linePerPage},${linePerPage}`);
            mysqlQuery(sql, function (err, accounts) {
                if (err) {
                    console.log(err);
                }
                var data = accounts;

                // use user.ejs
                res.render('user', { title: 'User Information', data: data, SearchAccount: SearchAccount, index: index, totalPage: totalPage, linePerPage: linePerPage });
            });
        });
    } else {
        return;
    }
});

// add page
router.get('/add', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    // use userAdd.ejs
    res.render('userAdd', { title: 'Add User', msg: '' });
});

// add post
router.post('/userAdd', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    // check Account exist
    var Account = req.body.Account;
    mysqlQuery('SELECT Account FROM AccountTbl WHERE Account = ?', Account, function (err, accounts) {
        if (err) {
            console.log(err);
        }

        var count = accounts.length;
        if (count > 0) {

            var msg = 'Account already exists.';
            res.render('userAdd', { title: 'Add User', msg: msg });

        } else {

            var sql = {
                Account: req.body.Account,
                Password: req.body.Password,
                Name: req.body.Name,
                CreateDate: Date.now() / 1000
            };

            //console.log(sql);
            mysqlQuery('INSERT INTO AccountTbl SET ?', sql, function (err, accounts) {
                if (err) {
                    console.log(err);
                }
                res.setHeader('Content-Type', 'application/json');
                res.redirect('/user');
            });
        }
    });
});

// edit page
router.get('/userEdit', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var AccountNo = req.query.AccountNo;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('SELECT * FROM AccountTbl WHERE AccountNo = ?', AccountNo, function (err, accounts) {
        if (err) {
            console.log(err);
        }

        var data = accounts;
        res.render('userEdit', { title: 'Edit user', data: data });
    });

});


router.post('/userEdit', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;
    var AccountNo = req.body.AccountNo;

    var sql = {
        Account: req.body.Account
    };

    if (req.body.Password) {
        sql.Password = req.body.Password;
    }

    if (req.body.Name) {
        sql.Name = req.body.Name;
    }

    if (req.body.Enable) {
        sql.Enable = req.body.Enable;
    }

    mysqlQuery('UPDATE AccountTbl SET ? WHERE AccountNo = ?', [sql, AccountNo], function (err, accounts) {
        if (err) {
            console.log(err);
        }
        if (req.body.Enable == false) {
            var token = AccountNo.toString(16);
            if (token.length == 1) {
                token = "000" + token;
            } else if (token.length == 2) {
                token = "00" + token;
            } else if (token.length == 3) {
                token = "0" + token;
            }
            var topic = `WAWA/${token}/C`;
            var paylod = JSON.stringify({ time: Date.now() });
            var mqttClient = req.mqttClient;
            mqttClient.publish(topic, paylod, { qos: 1, retain: false });
        }

        res.locals.Account = req.session.Account;
        res.locals.Name = req.session.Name;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/user');
    });

});


router.get('/userDelete', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var AccountNo = req.query.AccountNo;
    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('DELETE FROM AccountTbl WHERE AccountNo = ?', AccountNo, function (err, accounts) {
        if (err) {
            console.log(err);
        }
        res.redirect('/user');
    });
});

module.exports = router;
