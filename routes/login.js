var express = require('express'),
    router = express.Router(),
    //crypto = require('crypto'),
    title = '登入';


router.get('/', function(req, res, next) {
    if (req.session.sign) {
        res.locals.account = req.session.name;
    }
    res.render('login', {title:title});
});


router.post('/', function(req, res, next) {
    var db = req.con;
    var account = req.body['txtUserName'],
        password = req.body['txtUserPwd'];
        //md5 = crypto.createHash('md5');
    var cmd = "select * from mqtt_user where account = ?";
    db.query(cmd, [account], function (err, result) {
        if (err) {
            return;
        }
        if(result == '') {
            res.locals.error = '使用者不存在';
            res.render('login',{title:res.locals.error});
            return;
        }

        //password = md5.update(password).digest('hex');
        if(result[0].account != account || result[0].password != password) {
            res.locals.error = '使用者帳號或密碼錯誤';
            res.render('login',{title:res.locals.error});
            return;
        } else if (result[0].enable == 0) {
            res.locals.error = '使用者被拒絕存取';
            res.render('login',{title:res.locals.error});
            return;
        } else {
            res.locals.account = account;
            //設定session
            req.session.name = result[0].name; 
            req.session.sign = true;
            req.session.superuser = result[0].superuser;
            req.session.userid = result[0].id;
            console.log(req.session.name + " login!");       
            //res.render('login',{title:"登入成功"});
            res.redirect('/machine');
            return;
        }                    
    });                  
});


module.exports = router;