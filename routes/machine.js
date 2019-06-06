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

    var storeid = 0;
    storeid = req.query.storeid;

    var sql = 'SELECT * FROM mqtt_machine ';

    if (storeid && storeid != 0) {
        if (req.session.superuser != 1) {
            sql += ('WHERE ownerid = ' + req.session.userid + ' AND storeid = ' + storeid);
        } else {
            sql += ('WHERE storeid = ' + storeid);
        }
    } else {
        if (req.session.superuser != 1) {
            sql += ('WHERE ownerid = ' + req.session.userid);
        }
        storeid = 0;
    }
   
    
    db.query(sql, function(err, rows) {
        if (err) {
            console.log(err);
        }
        var data = rows;
        var storesql = 'SELECT id, name FROM mqtt_store ';
        if (req.session.superuser != 1) {
            storesql += ('WHERE ownerid = ' + req.session.userid);
        }
        db.query(storesql, function(err, rows) {
            if (err) {
                console.log(err);
            }
            var store = rows;
            store.splice(0,0,{id: 0, name: "全部"});
            for(var i = 0; i < data.length; i++) {
                if (Date.now() - data[i].updatedate < 5 * 60 * 1000) {
                    data[i].status = 1;
                } else {
                    data[i].status = 0;
                }
                for(var j = 0; j < store.length; j++) {
                    if(data[i].storeid == store[j].id) {
                        data[i].storename = store[j].name;
                        break;
                    }
                }
            }
            // use machine.ejs
            res.render('machine', { title: 'Machine Information', data: data,store: store, storeid: storeid, index: index });
        });    
    });

});

// history page
router.get('/machineHistory', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var serial = req.query.serial;

    var db = req.con;

    db.query('SELECT * FROM mqtt_client WHERE serial = ? order by id desc', serial, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;       
        res.render('machineHistory', { title: 'Machine History', data: data});
    });

});

// chart page
router.get('/machineChart', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var serial = req.query.serial;

    var db = req.con;

    db.query('SELECT * FROM mqtt_client WHERE serial = ? order by id asc', serial, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        var labels = [];
        var moneyDataSet = { data:[], backgroundColor:[], borderColor:[]};
        var giftDataSet = { data:[], backgroundColor:[], borderColor:[]};
        var money = 0;
        var gift = 0;
        var day = new Date(1);
        for (var i = 0; i < data.length; i++) {
            var date = new Date(data[i].date/1);
            if (date.getDate() != day.getDate() || date.getMonth() != day.getMonth() || date.getFullYear() != day.getFullYear()) {
                day = date;
                labels.push((date.getMonth() + 1) + "-" + date.getDate());
                
                moneyDataSet.data.push(data[i].money - money);
                moneyDataSet.backgroundColor.push('rgba(255, 99, 132, 0.2)');
                moneyDataSet.borderColor.push('rgba(255, 99, 132, 1)');
                money = data[i].money;
                
                giftDataSet.data.push(data[i].gift - gift);
                giftDataSet.backgroundColor.push('rgba(54, 162, 235, 0.2)');
                giftDataSet.borderColor.push('rgba(54, 162, 235, 1)');
                gift = data[i].gift;
            } else {
                if (money != data[i].money) {
                    var tempmoney = moneyDataSet.data.pop();
                    moneyDataSet.data.push(tempmoney + data[i].money - money);
                    money = data[i].money;
                }

                if (gift != data[i].gift) {
                    var tempgift = giftDataSet.data.pop();
                    giftDataSet.data.push(tempgift + data[i].gift - gift);
                    gift = data[i].gift;
                }
            }
        }       
        res.render('machineChart', { title: 'Machine Chart',labels: labels, moneyDataSet: moneyDataSet, giftDataSet: giftDataSet});
    });

});

var store
// edit page
router.get('/machineEdit', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var id = req.query.id;

    var db = req.con;

    db.query('SELECT * FROM mqtt_machine WHERE id = ?', id, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        db.query('SELECT * FROM mqtt_store', function(err, rows) {
            if (err) {
                console.log(err);
            }
    
            store = rows;
            res.render('machineEdit', { title: 'Edit Machine', data: data, store: store });
        });
    });

});


router.post('/machineEdit', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var db = req.con;

    var id = req.body.id;
    var storeid = req.body.storeid;
    var ownerid;
    for (var i = 0; i < store.length; i++) {
        if(store[i].id == storeid) {
            ownerid = store[i].ownerid;
            break;
        }
    }    
    var sql = {
        name: req.body.name,
        storeid: storeid,
        ownerid: ownerid
    };
    console.log(JSON.stringify(sql));
    db.query('UPDATE mqtt_machine SET ? WHERE id = ?', [sql, id], function(err, rows) {
        if (err) {
            console.log('UPDATE error:' + err);
        }

        res.setHeader('Content-Type', 'application/json');
        res.redirect('/');
    });    
});


router.get('/machineDelete', function(req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var id = req.query.id;

    var db = req.con;

    db.query('SELECT serial as serial FROM mqtt_machine WHERE id = ?', id, function(err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        if (data == '') {
            return;
        }
        console.log(JSON.stringify(data[0].serial));        
        db.query('DELETE FROM mqtt_client WHERE serial = ?', data[0].serial, function(err, rows) {
            if (err) {
                console.log(err);
            }
        });

        db.query('DELETE FROM mqtt_machine WHERE id = ?', id, function(err, rows) {
            if (err) {
                console.log(err);
            }
            
            res.redirect('/');
        });
    });

});

module.exports = router;
