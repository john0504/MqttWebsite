var express = require('express');
var router = express.Router();

// home page
function checkSession(req, res) {
    if (!req.session.sign || req.session.superuser == 0) {
        res.redirect('/');
        return false;
    } else {
        res.locals.account = req.session.name;
        res.locals.superuser = req.session.superuser;
    }
    return true;
}

router.get('/', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var db = req.con;
 

    db.query('SELECT * FROM mqtt_user ', function(err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;

        // use user.ejs
        res.render('user', { title: 'User Information', data: data });
    });

});

// add page
router.get('/add', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    // use userAdd.ejs
    res.render('userAdd', { title: 'Add User', msg: '' });
});

// add post
router.post('/userAdd', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var db = req.con;

    // check account exist
    var account = req.body.account;
    db.query('SELECT account FROM mqtt_user WHERE account = ?', account, function(err, rows) {
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
            var qur = db.query('INSERT INTO mqtt_user SET ?', sql, function(err, rows) {
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
router.get('/userEdit', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var id = req.query.id;

    var db = req.con;

    db.query('SELECT * FROM mqtt_user WHERE id = ?', id, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('userEdit', { title: 'Edit user', data: data });
    });

});


router.post('/userEdit', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var db = req.con;

    var id = req.body.id;

    var sql = {
      account: req.body.account,
      password: req.body.password,
      name: req.body.name,
      enable: req.body.enable
    };

   db.query('UPDATE mqtt_user SET ? WHERE id = ?', [sql, id], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/user');
    });

});


router.get('/userDelete', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var id = req.query.id;

    var db = req.con;

    db.query('DELETE FROM mqtt_user WHERE id = ?', id, function(err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/user');
    });
});

module.exports = router;
