var express = require('express');
var router = express.Router();
var linePerPage = 10;

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
    var DevName = "";
    var Account = "";
    var order = "";
    var timenow = parseInt(Date.now() / 1000 - 2 * 60);
    var totalOnline = 0;
    var index = parseInt(req.query.index) ? parseInt(req.query.index) : 0;
    if (index < 0) {
        index = 0;
    }
    var totalPage = 0;
    var mysqlQuery = req.mysqlQuery;
    var sql = 'SELECT count(*) as count from DeviceTbl'
    if (req.session.SuperUser != 1 && req.session.SuperUser != 2 && req.session.SuperUser != 4 && req.session.SuperUser != 5) {
        sql += (` WHERE AccountNo = ${req.session.AccountNo}`);
    } else if (req.session.SuperUser == 4 || req.session.SuperUser == 5) {
        sql += (` WHERE GroupNo = 68`);
    }
    mysqlQuery(sql, function (err, dev) {
        sql = 'SELECT count(*) as count from DeviceTbl'
        sql += (` WHERE UpdateDate >= ${timenow}`);
        if (req.session.SuperUser != 1 && req.session.SuperUser != 2 && req.session.SuperUser != 4 && req.session.SuperUser != 5) {
            sql += (` AND AccountNo = ${req.session.AccountNo}`);
        } else if (req.session.SuperUser == 4 || req.session.SuperUser == 5) {
            sql += (` AND GroupNo = 68`);
        }
        mysqlQuery(sql, function (err, dev2) {
            totalOnline = dev2[0].count;
            var total = dev[0].count;
            totalPage = Math.ceil(total / linePerPage);
            sql = 'SELECT a.*,b.Account FROM DeviceTbl a left join AccountTbl b on a.AccountNo = b.AccountNo';

            if (req.session.SuperUser != 1 && req.session.SuperUser != 2 && req.session.SuperUser != 4 && req.session.SuperUser != 5) {
                sql += (` WHERE a.AccountNo = ${req.session.AccountNo}`);
            } else if (req.session.SuperUser == 4 || req.session.SuperUser == 5) {
                sql += (` WHERE a.GroupNo = 68`);
            }
            // sql += (` order by a.DevName asc`);
            sql += (` limit ${index * linePerPage},${linePerPage}`);
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
                res.render('machine', {
                    title: 'Machine Information', data: devices, index: index, DevNo: DevNo,
                    DevName: DevName, Account: Account, totalPage: totalPage,
                    linePerPage: linePerPage, order: order, totalOnline: totalOnline
                });
            });
        });
    });
});

router.get('/search', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var index = parseInt(req.query.index) ? parseInt(req.query.index) : 0;
    if (index < 0) {
        index = 0;
    }
    var DevNo = req.query.DevNo;
    var DevName = req.query.DevName;
    var Account = req.query.Account;
    var order = req.query.order;
    var timenow = parseInt(Date.now() / 1000 - 2 * 60);
    var totalOnline = 0;
    var totalPage = 0;
    var mysqlQuery = req.mysqlQuery;

    var sql = 'SELECT count(*) as count from DeviceTbl'
    sql += (` WHERE UpdateDate >= ${timenow}`);
    if (req.session.SuperUser != 1 && req.session.SuperUser != 2 && req.session.SuperUser != 4 && req.session.SuperUser != 5) {
        sql += (` AND AccountNo = ${req.session.AccountNo}`);
    } else if (req.session.SuperUser == 4 || req.session.SuperUser == 5) {
        sql += (` AND GroupNo = 68`);
    }
    mysqlQuery(sql, function (err, dev2) {
        totalOnline = dev2[0].count;
        sql = 'SELECT count(*) as count from DeviceTbl a left join AccountTbl b on a.AccountNo = b.AccountNo'
        var haswhere = false;
        if (DevNo && DevNo != "") {
            sql += (` WHERE a.DevNo LIKE '%${DevNo}%'`);
            haswhere = true;
        }
        if (DevName && DevName != "") {
            if (!haswhere) {
                sql += (` WHERE a.DevName LIKE '%${DevName}%'`);
                haswhere = true;
            } else {
                sql += (` AND a.DevName LIKE '%${DevName}%'`);
            }
        }
        if (Account && Account != "") {
            if (!haswhere) {
                sql += (` WHERE b.Account LIKE '%${Account}%'`);
                haswhere = true;
            } else {
                sql += (` AND b.Account LIKE '%${Account}%'`);
            }
        }
        if (req.session.SuperUser != 1 && req.session.SuperUser != 2 && req.session.SuperUser != 4 && req.session.SuperUser != 5) {
            if (!haswhere) {
                sql += (` WHERE a.AccountNo = ${req.session.AccountNo}`);
                haswhere = true;
            } else {
                sql += (` AND a.AccountNo = ${req.session.AccountNo}`);
            }
        } else if (req.session.SuperUser == 4 || req.session.SuperUser == 5) {
            if (!haswhere) {
                sql += (` WHERE a.GroupNo = 68`);
                haswhere = true;
            } else {
                sql += (` AND a.GroupNo = 68`);
            }
        }
        mysqlQuery(sql, function (err, dev) {
            var total = dev[0].count;
            totalPage = Math.ceil(total / linePerPage);
            sql = 'SELECT a.*,b.Account FROM DeviceTbl a left join AccountTbl b on a.AccountNo = b.AccountNo';
            haswhere = false;
            if (DevNo && DevNo != "") {
                sql += (` WHERE a.DevNo LIKE '%${DevNo}%'`);
                haswhere = true;
            }
            if (DevName && DevName != "") {
                if (!haswhere) {
                    sql += (` WHERE a.DevName LIKE '%${DevName}%'`);
                    haswhere = true;
                } else {
                    sql += (` AND a.DevName LIKE '%${DevName}%'`);
                }
            }
            if (Account && Account != "") {
                if (!haswhere) {
                    sql += (` WHERE b.Account LIKE '%${Account}%'`);
                    haswhere = true;
                } else {
                    sql += (` AND b.Account LIKE '%${Account}%'`);
                }
            }
            if (req.session.SuperUser != 1 && req.session.SuperUser != 2 && req.session.SuperUser != 4 && req.session.SuperUser != 5) {
                if (!haswhere) {
                    sql += (` WHERE a.AccountNo = ${req.session.AccountNo}`);
                    haswhere = true;
                } else {
                    sql += (` AND a.AccountNo = ${req.session.AccountNo}`);
                }
            } else if (req.session.SuperUser == 4 || req.session.SuperUser == 5) {
                if (!haswhere) {
                    sql += (` WHERE a.GroupNo = 68`);
                    haswhere = true;
                } else {
                    sql += (` AND a.GroupNo = 68`);
                }
            }
            if (order && order != "") {
                sql += (` order by  ${order}`);
            }
            sql += (` limit ${index * linePerPage},${linePerPage}`);

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
                res.render('machine', {
                    title: 'Machine Information', data: devices, index: index, DevNo: DevNo,
                    DevName: DevName, Account: Account, totalPage: totalPage,
                    linePerPage: linePerPage, order: order, totalOnline: totalOnline
                });
            });
        });
    });
});

// history page
router.get('/machineHistory', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = req.query.DevNo;
    var index = parseInt(req.query.index) ? parseInt(req.query.index) : 0;
    if (index < 0) {
        index = 0;
    }
    var mysqlQuery = req.mysqlQuery;
    var sql = `SELECT count(*) as count from MessageTbl WHERE DevNo ='${DevNo}'`;
    mysqlQuery(sql, function (err, mes) {
        var total = mes[0].count;
        totalPage = Math.ceil(total / linePerPage);
        sql = `SELECT * FROM MessageTbl WHERE DevNo ='${DevNo}'`;
        sql += (`order by id desc limit ${index * linePerPage},${linePerPage}`);
        mysqlQuery(sql, function (err, msgs) {
            if (err) {
                console.log(err);
            }
            msgs.forEach(msg => {
                msg.totalmoney = (msg.H68 << 16) + msg.H69;
                msg.totalgift = (msg.H6A << 16) + msg.H6B;
            });
            var data = msgs;
            res.render('machineHistory', { title: 'Machine History', data: data, index: index, DevNo: DevNo, totalPage: totalPage, linePerPage: linePerPage });
        });
    });
});

// chart page
router.get('/machineChart', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var DevNo = req.query.DevNo;
    var DevName = req.query.DevName;
    var mysqlQuery = req.mysqlQuery;
    var index = parseInt(req.query.index) ? parseInt(req.query.index) : 0;

    var chartdate = new Date(Date.now());
    chartdate.setHours(0, 0, 0, 0);
    var datecodeEnd = parseInt(chartdate.getTime() / 1000);
    if (index != 0) {
        var month = chartdate.getMonth() + index + 1;
        var pastYear = parseInt(month / 12);
        chartdate.setFullYear(chartdate.getFullYear() + pastYear, month % 12, 1);
        datecodeEnd = parseInt(chartdate.getTime() / 1000) - 1;
    }
    chartdate.setDate(1);
    var datecodeStart = parseInt(chartdate.getTime() / 1000);
    if (index != 0) {
        chartdate = new Date(Date.now());
        var month = chartdate.getMonth() + index;
        var pastYear = parseInt(month / 12);
        chartdate.setFullYear(chartdate.getFullYear() + pastYear, month % 12, 1);
        chartdate.setHours(0, 0, 0, 0);
        datecodeStart = parseInt(chartdate.getTime() / 1000);
    }
    mysqlQuery('SELECT * FROM HistoryTbl WHERE DevNo = ? AND DateCode >= ? AND DateCode <  ? order by id desc', [DevNo, datecodeStart, datecodeEnd], function (err, msgs) {
        if (err) {
            console.log(err);
        }
        var data = msgs;
        var labels = [];
        var moneyDataSet = { data: [], backgroundColor: [], borderColor: [] };
        var giftDataSet = { data: [], backgroundColor: [], borderColor: [] };
        var totalMoney = 0;
        var totalGift = 0;

        for (var datecode = datecodeStart; datecode < datecodeEnd; datecode += 86400) {
            var dataExist = false;
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i].DateCode >= datecode && data[i].DateCode < datecode + 86400) {
                    dataExist = true;
                    if ((data[i].H6A << 16) + data[i].H6B <= 1000 && (data[i].H68 << 16) + data[i].H69 <= 1000) {
                        var date = new Date(data[i].DateCode * 1000);
                        labels.push((date.getMonth() + 1) + "-" + date.getDate());

                        moneyDataSet.data.push((data[i].H68 << 16) + data[i].H69);
                        moneyDataSet.backgroundColor.push('rgba(255, 99, 132, 0.2)');
                        moneyDataSet.borderColor.push('rgba(255, 99, 132, 1)');
                        totalMoney += ((data[i].H68 << 16) + data[i].H69);

                        giftDataSet.data.push((data[i].H6A << 16) + data[i].H6B);
                        giftDataSet.backgroundColor.push('rgba(54, 162, 235, 0.2)');
                        giftDataSet.borderColor.push('rgba(54, 162, 235, 1)');
                        totalGift += ((data[i].H6A << 16) + data[i].H6B);
                    } else {
                        var date = new Date(data[i].DateCode * 1000);
                        labels.push((date.getMonth() + 1) + "-" + date.getDate());

                        moneyDataSet.data.push(0.1);
                        moneyDataSet.backgroundColor.push('rgba(255, 99, 132, 0.2)');
                        moneyDataSet.borderColor.push('rgba(255, 99, 132, 1)');

                        giftDataSet.data.push(0.1);
                        giftDataSet.backgroundColor.push('rgba(54, 162, 235, 0.2)');
                        giftDataSet.borderColor.push('rgba(54, 162, 235, 1)');
                    }
                    break;
                }
            }
            if (!dataExist) {
                var date = new Date(datecode * 1000);
                labels.push((date.getMonth() + 1) + "-" + date.getDate());

                moneyDataSet.data.push(0);
                moneyDataSet.backgroundColor.push('rgba(255, 99, 132, 0.2)');
                moneyDataSet.borderColor.push('rgba(255, 99, 132, 1)');

                giftDataSet.data.push(0);
                giftDataSet.backgroundColor.push('rgba(54, 162, 235, 0.2)');
                giftDataSet.borderColor.push('rgba(54, 162, 235, 1)');
            }
        }


        res.render('machineChart', {
            title: 'Machine Chart', DevNo: DevNo, DevName: DevName,
            index: index, chartdate: chartdate, labels: labels, moneyDataSet: moneyDataSet,
            giftDataSet: giftDataSet, totalMoney: totalMoney, totalGift: totalGift
        });
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
        if (data.length != 0) {
            var date = new Date(data[0].ExpireDate * 1000);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            if (month < 10) {
                month = "0" + month;
            }
            var day = date.getDate();
            if (day < 10) {
                day = "0" + day;
            }
            data[0].ExpireStr = `${year}${month}${day}`;
        }
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
    var dateStr = req.body.ExpireDate;
    var year = dateStr.substring(0, 4);
    var month = dateStr.substring(4, 6);
    var day = dateStr.substring(6, 8);
    var date = new Date(year, month - 1, day, 0, 0, 0);
    var ExpireDate = date.getTime() / 1000;
    if (ExpireDate) {
        sql.ExpireDate = ExpireDate;
    }
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

        var mytopic = `WAWA/${token}/U`;
        var mymsg = { action: "list" };
        client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: false });

        var mytopic = `WAWA/${DevNo}/D`;
        var mymsg = { Account: "0000", Owner: token, CmdTimeStamp: Date.now() / 1000 };
        client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: true });

        var mytopic = `WAWA/${DevNo}/C`;
        var mymsg = "";
        client.publish(mytopic, mymsg, { qos: 1, retain: true });

        res.redirect('/machine');
    });
});

module.exports = router;
