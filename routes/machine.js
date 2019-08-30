var express = require('express');
var router = express.Router();

// home page
function checkSession(req, res) {
    if (!req.session.Sign) {
        res.redirect('/');
        return false;
    } else {
        res.locals.Account = req.session.Account;
        res.locals.Name = req.session.Name;
        res.locals.SuperUser = req.session.SuperUser;
    }
    return true;
}

router.get('/', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = "";
    var index = req.query.index ? req.query.index : 0;
    var mysqlQuery = req.mysqlQuery;

    var sql = 'SELECT a.*,b.Account FROM DeviceTbl a left join AccountTbl b on a.AccountNo = b.AccountNo';

    if (req.session.SuperUser == 0) {
        sql += (` WHERE a.AccountNo = ${req.session.AccountNo}`);
    }

    mysqlQuery(sql, function (err, devices) {
        if (err) {
            console.log(err);
        }
        devices.forEach(device => {
            if (device.UpdateDate >= Date.now() / 1000 - 2 * 60) {
                device.Status = 1;
            } else {
                device.Status = 0;
            }
        });
        res.render('machine', { title: 'Machine Information', data: devices, index: index, DevNo: DevNo });
    });
});

router.get('/search', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var index = req.query.index ? req.query.index : 0;
    var DevNo = req.query.DevNo;
    var mysqlQuery = req.mysqlQuery;

    var sql = 'SELECT a.*,b.Account FROM DeviceTbl a left join AccountTbl b on a.AccountNo = b.AccountNo';
    sql += (` WHERE a.DevNo LIKE '%${DevNo}%'`);
    if (req.session.SuperUser == 0) {
        sql += (` AND a.AccountNo = ${req.session.AccountNo}`);
    }

    mysqlQuery(sql, function (err, devices) {
        if (err) {
            console.log(err);
        }
        devices.forEach(device => {
            if (device.UpdateDate >= Date.now() / 1000 - 2 * 60) {
                device.Status = 1;
            } else {
                device.Status = 0;
            }
        });
        res.render('machine', { title: 'Machine Information', data: devices, index: index, DevNo: DevNo });
    });
});

// history page
router.get('/machineHistory', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = req.query.DevNo;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('SELECT * FROM MessageTbl WHERE DevNo = ? order by id desc limit 1000', DevNo, function (err, msgs) {
        if (err) {
            console.log(err);
        }

        var data = msgs;
        res.render('machineHistory', { title: 'Machine History', data: data });
    });

});

// chart page
router.get('/machineChart', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = req.query.DevNo;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('SELECT * FROM HistoryTbl WHERE DevNo = ? order by id desc limit 1000', DevNo, function (err, msgs) {
        if (err) {
            console.log(err);
        }
        var data = msgs;
        var labels = [];
        var moneyDataSet = { data: [], backgroundColor: [], borderColor: [] };
        var giftDataSet = { data: [], backgroundColor: [], borderColor: [] };

        for (var i = data.length - 1; i >= 0; i--) {
            var date = new Date(data[i].DateCode * 1000);
            labels.push((date.getMonth() + 1) + "-" + date.getDate());

            moneyDataSet.data.push((data[i].H68 << 16) + data[i].H69);
            moneyDataSet.backgroundColor.push('rgba(255, 99, 132, 0.2)');
            moneyDataSet.borderColor.push('rgba(255, 99, 132, 1)');

            giftDataSet.data.push((data[i].H6A << 16) + data[i].H6B);
            giftDataSet.backgroundColor.push('rgba(54, 162, 235, 0.2)');
            giftDataSet.borderColor.push('rgba(54, 162, 235, 1)');
        }
        res.render('machineChart', { title: 'Machine Chart', labels: labels, moneyDataSet: moneyDataSet, giftDataSet: giftDataSet });
    });

});

// edit page
router.get('/machineEdit', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = req.query.DevNo;

    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('SELECT * FROM DeviceTbl WHERE DevNo = ?', DevNo, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var data = rows;
        res.render('machineEdit', { title: 'Edit Machine', data: data });
    });

});


router.post('/machineEdit', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;

    var DevNo = req.body.DevNo;

    var sql = {
        DevName: req.body.Name
    };
    mysqlQuery('UPDATE DeviceTbl SET ? WHERE DevNo = ?', [sql, DevNo], function (err, rows) {
        if (err) {
            console.log('UPDATE error:' + err);
        }
        res.redirect('/machine');
    });
});


router.get('/machineDelete', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = req.query.DevNo;
    var AccountNo = req.query.AccountNo;
    var mysqlQuery = req.mysqlQuery;
    var client = req.mqttClient;
    console.log(`DevNo:${DevNo} AccountNo:${AccountNo}`);
    var token = AccountNo.toString(16);
    if (token.length == 1) {
        token = "000" + token;
    } else if (token.length == 2) {
        token = "00" + token;
    } else if (token.length == 3) {
        token = "0" + token;
    }
    mysqlQuery('UPDATE DeviceTbl SET AccountNo = NULL WHERE DevNo = ?', DevNo, function (err, rows) {
        if (err) {
            console.log(err);
        }

        var mytopic = `WAWA/${token}/U`
        var mymsg = { action: "list" };
        client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: false });

        var mytopic = `WAWA/${DevNo}/D`
        var mymsg = { Account: "0000", Owner: token };
        client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: true });

        res.redirect('/machine');
    });
});

module.exports = router;
