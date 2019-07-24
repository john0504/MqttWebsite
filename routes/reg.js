var express = require('express'),
    router = express.Router(),
    crypto = require('crypto'),
    TITLE_REG = '註冊'
msg = '';

router.get('/', function (req, res) {
    res.render('reg', { title: TITLE_REG });
});

router.post('/', function (req, res) {
    var userAccount = req.body['txtUserAccount'],
        userPwd = req.body['txtUserPwd'],
        userName = req.body['txtUserName'];

    var mysqlQuery = req.mysqlQuery;

    // check Account exist
    var Account = userAccount;
    mysqlQuery('SELECT Account FROM AccountTbl WHERE Account = ?', Account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {

            var msg = '帳號名稱重複！';
            res.render('reg', { title: TITLE_REG, msg: msg });

        } else {
            var sql = {
                Account: userAccount,
                Password: userPwd,
                Name: userName,
                CreateDate: Date.now()/1000
            };

            //console.log(sql);
            mysqlQuery('INSERT INTO AccountTbl SET ?', sql, function (err, rows) {
                if (err) {
                    console.log(err);
                }
                res.setHeader('Content-Type', 'application/json');
                res.redirect('/');
            });
        }
    });
});
module.exports = router;