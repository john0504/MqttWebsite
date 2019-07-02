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

    // check account exist
    var account = userAccount;
    mysqlQuery('SELECT account FROM mqtt_user WHERE account = ?', account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {

            var msg = '帳號名稱重複！';
            res.render('reg', { title: TITLE_REG, msg: msg });

        } else {
            var sql = {
                account: userAccount,
                password: userPwd,
                name: userName,
                createdate: Date.now()
            };

            //console.log(sql);
            mysqlQuery('INSERT INTO mqtt_user SET ?', sql, function (err, rows) {
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