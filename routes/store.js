var express = require('express');
var router = express.Router();

// home page
function checkSession(req, res) {
    if (!req.session.sign) {
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
    var index = req.query.index ? req.query.index : 0;
    var db = req.con;
    var sql = 'SELECT * FROM mqtt_store ';
    if (req.session.superuser != 1) {
        sql += ('WHERE ownerid = ' + req.session.userid);
    }
    db.query(sql, function(err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        
        db.query('SELECT id, name FROM mqtt_user', function(err, rows) {
            if (err) {
                console.log(err);
            }            
            var user = rows;
            for(var i = 0; i < data.length; i++) {
                for(var j = 0; j < user.length; j++) {
                    if(data[i].ownerid == user[j].id) {
                        data[i].owner = user[j].name;
                        break;
                    }
                }
            }
            // use store.ejs
            res.render('store', { title: 'Store Information', data: data, user: user, index: index });
        });
    });

});

// add page
router.get('/add', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var db = req.con;
    db.query('SELECT id, name FROM mqtt_user', function(err, rows){
        if (err) {
            console.log(err);
        }

        user = rows;
        // use storeAdd.ejs
        res.render('storeAdd', { title: 'Add Store', msg: '', user: user }); 
    });
    
});

// add post
router.post('/storeAdd', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var db = req.con;   

    var sql = {
        name: req.body.name,
        ownerid: req.body.ownerid,
        area: req.body.area,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        createdate: Date.now()
    };

    //console.log(sql);
    var qur = db.query('INSERT INTO mqtt_store SET ?', sql, function(err, rows) {
        if (err) {
            console.log(err);
        }
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/store');
    });
});

// edit page
router.get('/storeEdit', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var id = req.query.id;

    var db = req.con;

    db.query('SELECT * FROM mqtt_store WHERE id = ?', id, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        db.query('SELECT id, name FROM mqtt_user', function(err, rows){
            if (err) {
                console.log(err);
            }
    
            user = rows;           
            res.render('storeEdit', { title: 'Edit store', data: data, user: user});
             
        });
    });
});


router.post('/storeEdit', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var db = req.con;

    var id = req.body.id;

    var sql = {      
        ownerid: req.body.ownerid,
        area: req.body.area,
        address: req.body.address,
        lat: req.body.lat,
        lng: req.body.lng,
        status: req.body.status
    };

   db.query('UPDATE mqtt_store SET ? WHERE id = ?', [sql, id], function(err, rows) {
        if (err) {
            console.log(err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/store');
    });

});


router.get('/storeDelete', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var id = req.query.id;

    var db = req.con;

    db.query('DELETE FROM mqtt_store WHERE id = ?', id, function(err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/store');
    });
});

module.exports = router;
