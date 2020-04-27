var express = require('express'),
    router = express.Router();
var crypto = require('crypto');

var uid = "0952752498";
var pwd = "";

router.put('/session', function (req, res) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['account'],
        token = req.body['token'];
    var AccountNo = parseInt(token, 16);
    if (!Account || !token) {
        return;
    }
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
    if (!Account || !Password) {
        return;
    }

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
    if (!Account || !Password || !token) {
        return;
    }

    var phonetoken = 'cectphone' + Account;

    var md5 = crypto.createHash('md5');
    phonetoken = md5.update(phonetoken).digest('hex').substring(0, 8);
    if (token != phonetoken) {
        res.status(401).send('Auth fail.');
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
                    var token = AccountNo.toString(16);
                    if (token.length == 1) {
                        token = "000" + token;
                    } else if (token.length == 2) {
                        token = "00" + token;
                    } else if (token.length == 3) {
                        token = "0" + token;
                    }
                    res.status(200).send({ token: token });
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

router.post('/sendsms', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['phone'];
    if (!Account) {
        return;
    }
    mysqlQuery('SELECT Account FROM AccountTbl WHERE Account = ?', Account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {
            res.status(400).send('The phone has already been taken.');
            return;
        } else {
            var phonetoken = 'cectphone' + Account;
            var md5 = crypto.createHash('md5');
            phonetoken = md5.update(phonetoken).digest('hex').substring(0, 8);
            var api = "https://oms.every8d.com/API21/HTTP/sendSMS.ashx";
            var msg = `Your%20token%20is%20${phonetoken}`
            var url = `${api}?UID=${uid}&PWD=${pwd}&SB=&MSG=${msg}&DEST=${Account}`;
            var request = require('request');
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            });
            res.status(200).send({});
        }
    });
});

router.post('/resetsms', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['phone'];
    if (!Account) {
        return;
    }
    mysqlQuery('SELECT * FROM AccountTbl WHERE Account = ?', Account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count == 0) {
            res.status(400).send('Auth fail.');
            return;
        } else {
            var password = rows[0].Password;
            var api = "https://oms.every8d.com/API21/HTTP/sendSMS.ashx";
            var msg = `Your%20password%20is%20${password}`
            var url = `${api}?UID=${uid}&PWD=${pwd}&SB=&MSG=${msg}&DEST=${Account}`;
            var request = require('request');
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body);
                }
            });
            res.status(200).send({});
        }
    });
});

router.post('/sendmail', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var Account = req.body['email'];
    if (!Account) {
        return;
    }
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
            var phonetoken = 'cectphone' + Account;
            var md5 = crypto.createHash('md5');
            phonetoken = md5.update(phonetoken).digest('hex').substring(0, 8);
            mail.sendMail({
                from: 'no-reply <cect@cectco.com>',
                to: Account + ' <' + Account + '>',
                subject: 'Welcome to register CECT',
                html: '<h1>' + phonetoken +
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
    if (!Account) {
        return;
    }
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
            var password = rows[0].Password;
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
    var CardNo = req.body['code'].trim();

    if (!Account || !token || !DevNo || !CardNo) {
        return;
    }

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
                mysqlQuery('SELECT * FROM DeviceTbl WHERE DevNo = ?'
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
                                            var addTime = 31536000;
                                            if (payment[0].CardMonth) {
                                                addTime = payment[0].CardMonth * 30 * 24 * 60 * 60;
                                            }
                                            var ExpireDate = device[0].ExpireDate;
                                            if (ExpireDate - Date.now() / 1000 > 0) {
                                                ExpireDate += addTime;
                                            } else {
                                                ExpireDate = Date.now() / 1000 + addTime;
                                            }
                                            var sql = {
                                                Used: 1,
                                                Account: Account,
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
                                                        , [ExpireDate, device[0].DevNo], function (err, result2) {
                                                            if (err) {
                                                                console.log(err);
                                                            }
                                                            res.status(200).send({});
                                                            var topic = `WAWA/${token}/U`;
                                                            var paylod = JSON.stringify({ action: "list" });

                                                            var mqttClient = req.mqttClient;
                                                            mqttClient.publish(topic, paylod, { qos: 1, retain: false });
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