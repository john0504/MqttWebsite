var express = require('express'),
    router = express.Router();
var crypto = require('crypto');

router.put('/session', function (req, res) {
    var mysqlQuery = req.mysqlQuery;
    var account = req.body['account'],
        token = req.body['token'];
    var cmd = "select * from mqtt_user where account = ?";
    mysqlQuery(cmd, [account], function (err, result) {
        if (err) {
            return;
        }
        if (result == '') {
            res.status(400).send('使用者不存在');
            return;
        }

        if (result[0].account != account || account + ':' + result[0].password != token) {
            res.status(400).send('token錯誤');
            return;
        } else if (result[0].enable == 0) {
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
    var account = req.body['email'],
        password = req.body['password'];
    var cmd = "select * from mqtt_user where account = ?";
    mysqlQuery(cmd, [account], function (err, result) {
        if (err) {
            return;
        }
        if (result == '') {
            res.status(400).send('Auth fail.');
            return;
        }

        if (result[0].account != account || result[0].password != password) {
            res.status(400).send('Auth fail.');
            return;
        } else if (result[0].enable == 0) {
            res.status(400).send('使用者被拒絕存取');
            return;
        } else {
            res.status(200).send({ token: account + ":" + password });
            return;
        }
    });
});

router.put('/user', function (req, res) {
    var account = req.body['account'],
        password = req.body['password'],
        token = req.body['token'];

    var mailtoken = 'cectmail' + account;

    var md5 = crypto.createHash('md5');
    mailtoken = md5.update(mailtoken).digest('hex').substring(0, 8);
    if (token != mailtoken) {
        res.status(400).send('Auth fail.');
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    // check account exist 

    mysqlQuery('SELECT account FROM mqtt_user WHERE account = ?', account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {
            res.status(400).send('The email has already been taken.');
            return;

        } else {
            var sql = {
                account: account,
                password: password,
                name: account,
                createdate: Date.now()
            };

            //console.log(sql);
            mysqlQuery('INSERT INTO mqtt_user SET ?', sql, function (err, rows) {
                if (err) {
                    console.log(err);
                }
                res.status(200).send({ token: account + ":" + password });
                return;
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
    var account = req.body['email'];
    mysqlQuery('SELECT account FROM mqtt_user WHERE account = ?', account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {
            res.status(400).send('The email has already been taken.');
            return;

        } else {
            var mail = req.mailTransport;
            var mailtoken = 'cectmail' + account;
            var md5 = crypto.createHash('md5');
            mailtoken = md5.update(mailtoken).digest('hex').substring(0, 8);
            mail.sendMail({
                from: 'no-reply <cect@cectco.com>',
                to: account + ' <' + account + '>',
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
    var account = req.body['email'];
    mysqlQuery('SELECT * FROM mqtt_user WHERE account = ?', account, function (err, rows) {
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
                to: account + ' <' + account + '>',
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

router.post('/alldevice', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var account = req.body['account'];
    var token = req.body['token'];
    mysqlQuery('SELECT * FROM mqtt_user WHERE account = ?', account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count == 0) {
            res.status(400).send('Auth fail.');
            return;
        } else {
            if (account + ':' + rows[0].password != token) {
                res.status(400).send('token錯誤');
                return;
            } else if (rows[0].enable == 0) {
                res.status(400).send('使用者被拒絕存取');
                return;
            } else {
                mysqlQuery('SELECT * FROM mqtt_machine WHERE account = ?', account, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    var count = result.length;
                    var message = { data: [] };

                    for (var i = 0; i < count; i++) {
                        var device = {
                            name: result[i].name,
                            serial: result[i].serial,
                            type: result[i].type,
                            bank: result[i].bank,
                            money: result[i].money,
                            gift: result[i].gift,
                            // expiredate: result[i].expiredate,
                            status: Date.now() - result[i].updatedate < 5 * 60 * 1000 ? 1 : 0
                        };
                        message.data.push(device);
                    }
                    res.status(200).send(message);
                    return;

                });
                return;
            }
        }
    });
});

router.post('/updatedevice', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var account = req.body['account'];
    var token = req.body['token'];
    var serial = req.body['serial'];
    var data = req.body['data'];
    mysqlQuery('SELECT * FROM mqtt_user WHERE account = ?', account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count == 0) {
            res.status(400).send('Auth fail.');
            return;
        } else {
            if (account + ':' + rows[0].password != token) {
                res.status(400).send('token錯誤');
                return;
            } else if (rows[0].enable == 0) {
                res.status(400).send('使用者被拒絕存取');
                return;
            } else {
                mysqlQuery('SELECT * FROM mqtt_machine WHERE account = ? AND serial = ?'
                    , [account, serial], function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        mysqlQuery('UPDATE mqtt_machine SET ? WHERE id = ?'
                            , [data, result[0].id], function (err, result2) {
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
});

router.post('/deletedevice', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var account = req.body['account'];
    var token = req.body['token'];
    var serial = req.body['serial'];
    mysqlQuery('SELECT * FROM mqtt_user WHERE account = ?', account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count == 0) {
            res.status(400).send('Auth fail.');
            return;
        } else {
            if (account + ':' + rows[0].password != token) {
                res.status(400).send('token錯誤');
                return;
            } else if (rows[0].enable == 0) {
                res.status(400).send('使用者被拒絕存取');
                return;
            } else {
                mysqlQuery('SELECT * FROM mqtt_machine WHERE account = ? AND serial = ?'
                    , [account, serial], function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        if (result.length == 0) {
                            res.status(200).send({});
                        } else {
                            mysqlQuery('UPDATE mqtt_machine SET account = NULL WHERE id = ?'
                                , result[0].id, function (err, result2) {
                                    if (err) {
                                        console.log(err);
                                    }
    
                                    res.status(200).send({});
                                    return;
                                });
                        }
                    });
            }
        }
    });
});

router.post('/payment', function (req, res, next) {
    var mysqlQuery = req.mysqlQuery;
    var account = req.body['account'];
    var token = req.body['token'];
    var serial = req.body['serial'];
    var code = req.body['code'];
    mysqlQuery('SELECT * FROM mqtt_user WHERE account = ?', account, function (err, rows) {
        if (err) {
            console.log(err);
        }
        var count = rows.length;
        if (count == 0) {
            res.status(400).send('Auth fail.');
            return;
        } else {
            if (account + ':' + rows[0].password != token) {
                res.status(400).send('token錯誤');
                return;
            } else if (rows[0].enable == 0) {
                res.status(400).send('使用者被拒絕存取');
                return;
            } else {
                mysqlQuery('SELECT serial FROM mqtt_machine WHERE serial = ?'
                    , serial, function (err, machine) {
                    if (err) {
                        console.log(err);
                    }
                    var count = machine.length;
                    if (count == 0) {
                        res.status(400).send('There is no this serial.');
                        return;
                    } else {
                        mysqlQuery('SELECT * FROM mqtt_payment WHERE code = ?'
                            , code, function (err, payment) {
                            if (err) {
                                console.log(err);
                            }
                            var count = payment.length;
                            if (count == 0) {
                                res.status(400).send('There is no this payment code.');
                                return;
                            } else {
                                if (payment[0].used == 1) {
                                    res.status(400).send('This payment code has been used.');
                                    return;
                                } else {
                                    var expiredate = machine[0].expiredate;
                                    if (expiredate - Date.now() > 0) {
                                        expiredate += 31536000000;
                                    } else {
                                        expiredate =  Date.now() + 31536000000;
                                    }
                                    var sql = {used: 1, account: account, paydate: Date.now()};
                                    mysqlQuery('UPDATE mqtt_payment SET ? WHERE id = ?'
                                        , [sql, payment[0].id], function (err, result) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        mysqlQuery('UPDATE mqtt_machine SET expiredate = ? WHERE id = ?'
                                            , [expiredate, machine[0].id], function (err, result2) {
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