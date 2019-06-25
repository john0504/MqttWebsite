var express = require('express'),
     router = express.Router();
var crypto = require('crypto');

router.put('/session', function(req, res) {  
    var db = req.con;
    var account = req.body['account'],
        token = req.body['token'];
    var cmd = "select * from mqtt_user where account = ?";
    db.query(cmd, [account], function (err, result) {
        if (err) {
            return;
        }
        if(result == '') {
            res.status(400).send('使用者不存在');
            return;
        }

        if(result[0].account != account || account+':'+result[0].password != token) {         
            res.status(400).send('token錯誤');
            return;
        } else if (result[0].enable == 0) {
            res.status(400).send('使用者被拒絕存取');
            return;
        } else { 
            res.status(200).send("OK");
            return;
        }                    
    });
});

router.post('/session', function(req, res, next) {
    var db = req.con;
    var account = req.body['email'],
        password = req.body['password'];
    var cmd = "select * from mqtt_user where account = ?";
    db.query(cmd, [account], function (err, result) {
        if (err) {
            return;
        }
        if(result == '') {
            res.status(400).send('Auth fail.');
            return;
        }

        if(result[0].account != account || result[0].password != password) {         
            res.status(400).send('Auth fail.');
            return;
        } else if (result[0].enable == 0) {
            res.status(400).send('使用者被拒絕存取');
            return;
        } else { 
            res.status(200).send({token:account+":"+password});
            return;
        }                    
    });                  
});

router.put('/user', function(req, res) {
    var account = req.body['account'],
    password = req.body['password'],
    token = req.body['token'];
    
    var mailtoken = 'cectmail' + account;
    
    var md5 = crypto.createHash('md5');
    mailtoken = md5.update(mailtoken).digest('hex').substring(0,8);
    if (token != mailtoken) {
        res.status(400).send('Auth fail.');
        return;
    }
    var db = req.con;
  
    // check account exist 

    db.query('SELECT account FROM mqtt_user WHERE account = ?', account, function(err, rows) {
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
            db.query('INSERT INTO mqtt_user SET ?', sql, function(err, rows) {
                if (err) {
                    console.log(err);
                }
                res.status(200).send({token:account+":"+password});
                return;
          });
        }
    });
});

router.get('/fw/list', function(req, res) {
    res.status(200).send([]);
    return;
});

router.get('/info-model', function(req, res) {
    res.status(200).send({});
    return;
});

router.post('/sendmail', function(req, res, next) {
    var db = req.con;
    var account = req.body['email'];
    db.query('SELECT account FROM mqtt_user WHERE account = ?', account, function(err, rows) {
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
            mailtoken = md5.update(mailtoken).digest('hex').substring(0,8);
            mail.sendMail({
                from: 'no-reply <cect@cectco.com>',
                to: account + ' <' + account + '>',
                subject: 'Welcome to register CECT',
                html: '<h1>' + mailtoken + 
                '</h1><p>This is your registration key. </p>'+
                '<p>If you have not applied to register, please ignore this mail.</p>'
            }, function(err){
                if (err) {
                    console.log('Unable to send email: ' + err);
                }
            });
            res.status(200).send({});
        }
    });                
});

router.post('/reset', function(req, res, next) {
    var db = req.con;
    var account = req.body['email'];
    db.query('SELECT * FROM mqtt_user WHERE account = ?', account, function(err, rows) {
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
                '</h1><p>This is your password. </p>'+
                '<p>If you have not applied to get password, please ignore this mail.</p>'
            }, function(err){
                if (err) {
                    console.log('Unable to send email: ' + err);
                }
            });
            res.status(200).send("OK");
        }
    });                
});

module.exports = router;