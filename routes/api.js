var express = require('express'),
     router = express.Router();

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
    password = req.body['password'];
  
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

module.exports = router;