var express = require('express'),
    router = express.Router();
var crypto = require('crypto');

router.put('/session', function (req, res) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['account'],
        token = req.body['token'];
    var AccountNo = parseInt(token, 16);
    var cmd = "select * from AccountTbl where Account = ?";
    mysqlQuery(cmd, [Account], function (err, result) {
        if (err) {
            return;
        }
        if (result == '') {
            res.status(400).send('使用者不存在');
            return;
        }

        if (result[0].Account != Account || result[0].AccountNo != AccountNo) {
            res.status(400).send('token錯誤');
            return;
        } else if (result[0].Enable == 0) {
            res.status(400).send('使用者被拒絕存取');
            return;
        } else {
            res.status(200).send({});
            return;
        }
    });
});

router.post('/session', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['email'],
        Password = req.body['password'];
    var cmd = "select * from AccountTbl where Account = ?";
    console.log(`Account=${Account}&Password=${Password}`);
    mysqlQuery(cmd, [Account], function (err, result) {
        if (err) {
            console.log(`err=${JSON.stringify(err)}`);
            return;
        }
        if (result == '') {
            res.status(400).send('Auth fail.');
            return;
        }

        if (result[0].Account != Account || result[0].Password != Password) {
            res.status(400).send('Auth fail.');
            return;
        } else if (result[0].Enable == 0) {
            res.status(400).send('使用者被拒絕存取');
            return;
        } else {
            var token = result[0].AccountNo.toString(16);
            if (token.length == 1) {
                token = "000" + token;
            } else if (token.length == 2) {
                token = "00" + token;
            } else if (token.length == 3) {
                token = "0" + token;
            }
            res.status(200).send({ token: token });
            return;
        }
    });
});

router.put('/user', function (req, res) {
    var Account = req.body['account'],
        Password = req.body['password'],
        token = req.body['token'];

    var mailtoken = 'cectmail' + Account;

    var md5 = crypto.createHash('md5');
    mailtoken = md5.update(mailtoken).digest('hex').substring(0, 8);
    if (token != mailtoken) {
        res.status(400).send('Auth fail.');
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    // check Account exist 

    mysqlQuery('SELECT Account FROM AccountTbl WHERE Account = ?', Account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {
            res.status(400).send('The email has already been taken.');
            return;

        } else {
            var sql = {
                Account: Account,
                Password: Password,
                Name: Account,
                CreateDate: Date.now() / 1000
            };

            //console.log(sql);
            mysqlQuery('INSERT INTO AccountTbl SET ?', sql, function (err, rows) {
                if (err) {
                    console.log(err);
                }
                mysqlQuery('SELECT * FROM AccountTbl WHERE Account = ?', Account, function (err, rows) {
                    var AccountNo = rows[0].AccountNo;
                    res.status(200).send({ token: AccountNo });
                    return;
                });
            });
        }
    });
});

router.get('/fw/list', function (req, res) {
    res.status(200).send([]);
    return;
});

router.get('/info-model', function (req, res) {
    res.status(200).send({});
    return;
});

router.post('/sendmail', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['email'];
    mysqlQuery('SELECT Account FROM AccountTbl WHERE Account = ?', Account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {
            res.status(400).send('The email has already been taken.');
            return;

        } else {
            var mail = req.mailTransport;
            var mailtoken = 'cectmail' + Account;
            var md5 = crypto.createHash('md5');
            mailtoken = md5.update(mailtoken).digest('hex').substring(0, 8);
            mail.sendMail({
                from: 'no-reply <cect@cectco.com>',
                to: Account + ' <' + Account + '>',
                subject: 'Welcome to register CECT',
                html: '<h1>' + mailtoken +
                    '</h1><p>This is your registration key. </p>' +
                    '<p>If you have not applied to register, please ignore this mail.</p>'
            }, function (err) {
                if (err) {
                    console.log('Unable to send email: ' + err);
                }
            });
            res.status(200).send({});
        }
    });
});

router.post('/reset', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['email'];
    mysqlQuery('SELECT * FROM AccountTbl WHERE Account = ?', Account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count == 0) {
            res.status(400).send('Auth fail.');
            return;
        } else {
            var mail = req.mailTransport;
            var password = rows[0].password;
            mail.sendMail({
                from: 'no-reply <cect@cectco.com>',
                to: Account + ' <' + Account + '>',
                subject: 'Forget your CECT password?',
                html: '<h1>' + password +
                    '</h1><p>This is your password. </p>' +
                    '<p>If you have not applied to get password, please ignore this mail.</p>'
            }, function (err) {
                if (err) {
                    console.log('Unable to send email: ' + err);
                }
            });
            res.status(200).send({});
        }
    });
});

router.post('/payment', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['account'];
    var token = req.body['token'];
    var AccountNo = parseInt(token, 16);
    var DevNo = req.body['serial'];
    var CardNo = req.body['code'];
    mysqlQuery('SELECT * FROM AccountTbl WHERE Account = ?', Account, function (err, rows) {
        if (err) {
            console.log(err);
        }
        var count = rows.length;
        if (count == 0) {
            res.status(400).send('Auth fail.');
            return;
        } else {
            if (rows[0].AccountNo != AccountNo) {
                res.status(400).send('token錯誤');
                return;
            } else if (rows[0].Enable == 0) {
                res.status(400).send('使用者被拒絕存取');
                return;
            } else {
                mysqlQuery('SELECT DevNo FROM DeviceTbl WHERE DevNo = ?'
                    , DevNo, function (err, device) {
                        if (err) {
                            console.log(err);
                        }
                        var count = device.length;
                        if (count == 0) {
                            res.status(400).send('There is no this DevNo.');
                            return;
                        } else {
                            mysqlQuery('SELECT * FROM PaymentTbl WHERE CardNo = ?'
                                , CardNo, function (err, payment) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    var count = payment.length;
                                    if (count == 0) {
                                        res.status(400).send('There is no this payment CardNo.');
                                        return;
                                    } else {
                                        if (payment[0].Used == 1) {
                                            res.status(400).send('This payment CardNo has been used.');
                                            return;
                                        } else {
                                            var ExpireDate = device[0].ExpireDate;
                                            if (ExpireDate - Date.now() / 1000 > 0) {
                                                ExpireDate += 31536000;
                                            } else {
                                                ExpireDate = Date.now() / 1000 + 31536000;
                                            }
                                            var sql = {
                                                Used: 1,
                                                AccountNo: AccountNo,
                                                PayDate: Date.now() / 1000,
                                                DevNo: DevNo
                                            };
                                            mysqlQuery('UPDATE PaymentTbl SET ? WHERE CardNo = ?'
                                                , [sql, payment[0].CardNo], function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    mysqlQuery('UPDATE DeviceTbl SET ExpireDate = ? WHERE DevNo = ?'
                                                        , [expiredate, device[0].DevNo], function (err, result2) {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            res.status(200).send({});
                                                            return;
                                                        });
                                                });
                                        }
                                    }
                                });
                        }
                    });
            }
        }
    });
});

module.exports = router;