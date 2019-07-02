var express = require('express');
var router = express.Router();

// home page
function checkSession(req, res) {
    if (!req.session.sign) {
        res.redirect('/');
        return false;
    } else {
        res.locals.account = req.session.account;
        res.locals.name = req.session.name;
        res.locals.superuser = req.session.superuser;
    }
    return true;
}

router.get('/', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    if (req.session.superuser == 1) {
        mysqlQuery('SELECT * FROM mqtt_user ', function (err, rows) {
            if (err) {
                console.log(err);
            }
            var data = rows;

            // use user.ejs
            res.render('user', { title: 'User Information', data: data });
        });
    } else {
        var account = req.session.account;
        console.log(account);
        mysqlQuery('SELECT * FROM mqtt_user WHERE account = ?', account, function (err, rows) {
            if (err) {
                console.log(err);
            }
            var data = rows;

            // use user.ejs
            res.render('user', { title: 'User Information', data: data });
        });
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

    // check account exist
    var account = req.body.account;
    mysqlQuery('SELECT account FROM mqtt_user WHERE account = ?', account, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var count = rows.length;
        if (count > 0) {

            var msg = 'Account already exists.';
            res.render('userAdd', { title: 'Add User', msg: msg });

        } else {

            var sql = {
                account: req.body.account,
                password: req.body.password,
                name: req.body.name,
                createdate: Date.now()
            };

            //console.log(sql);
            var qur = mysqlQuery('INSERT INTO mqtt_user SET ?', sql, function (err, rows) {
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
    var id = req.query.id;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('SELECT * FROM mqtt_user WHERE id = ?', id, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('userEdit', { title: 'Edit user', data: data });
    });

});


router.post('/userEdit', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    var id = req.body.id;

    var sql = {
        account: req.body.account,
        password: req.body.password,
        name: req.body.name
    };

    if (req.body.enable) {
        sql.enable = req.body.enable;
    }

    mysqlQuery('UPDATE mqtt_user SET ? WHERE id = ?', [sql, id], function (err, rows) {
        if (err) {
            console.log(err);
        }
        
        res.locals.account = req.session.account;
        res.locals.name = req.session.name;
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/user');
    });

});


router.get('/userDelete', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var id = req.query.id;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('DELETE FROM mqtt_user WHERE id = ?', id, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/user');
    });
});

module.exports = router;
