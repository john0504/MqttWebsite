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
    var index = parseInt(req.query.index) ? parseInt(req.query.index) : 0;
    if (index < 0) {
        index = 0;
    }
    var DateCode = req.query.datecode;
    var DevNo = req.query.DevNo;
    var monthlydate = new Date(Date.now());
    monthlydate.setDate(1);
    monthlydate = new Date(monthlydate.getTime() - 24 * 60 * 60 * 1000);
    monthlydate.setDate(1);
    monthlydate.setHours(0, 0, 0, 0);
    if (DateCode) {
        monthlydate = new Date(DateCode * 1000);
    }
    var totalPage = 0;
    var mysqlQuery = req.mysqlQuery;
    var sql = 'SELECT count(*) as count from MonthlyTbl a left join DeviceTbl b on a.DevNo = b.DevNo'
    if (req.session.SuperUser == 0) {
        sql += (` WHERE b.AccountNo = ${req.session.AccountNo}`);
        if (DateCode) {
            sql += (` AND a.DateCode = ${DateCode}`);
        }
        if (DevNo) {
            sql += (` AND a.DevNo = '${DevNo}'`);
        }
    } else {
        if (DateCode) {
            sql += (` WHERE a.DateCode = ${DateCode}`);

            if (DevNo) {
                sql += (` AND a.DevNo = '${DevNo}'`);
            }
        } else {
            if (DevNo) {
                sql += (` WHERE a.DevNo = '${DevNo}'`);
            }
        }
    }
    console.log(`${JSON.stringify(sql)}`);
    mysqlQuery(sql, function (err, dev) {
        var total = dev[0].count;
        totalPage = Math.ceil(total / linePerPage);
        sql = 'SELECT a.*,b.DevName, c.Account FROM MonthlyTbl a left join DeviceTbl b on a.DevNo = b.DevNo left join AccountTbl c on b.AccountNo = c.AccountNo';

        if (req.session.SuperUser == 0) {
            sql += (` WHERE b.AccountNo = ${req.session.AccountNo}`);
            if (DateCode) {
                sql += (` AND a.DateCode = ${DateCode}`);
            }
            if (DevNo) {
                sql += (` AND a.DevNo = '${DevNo}'`);
            }
        } else {
            if (DateCode) {
                sql += (` WHERE a.DateCode = ${DateCode}`);

                if (DevNo) {
                    sql += (` AND a.DevNo = '${DevNo}'`);
                }
            } else {
                if (DevNo) {
                    sql += (` WHERE a.DevNo = '${DevNo}'`);
                }
            }
        }
        sql += (` order by id desc`);
        sql += (` limit ${index * linePerPage},${linePerPage}`);

        mysqlQuery(sql, function (err, devices) {
            if (err) {
                console.log(err);
            }
            res.render('monthly', {
                title: 'Monthly Information', data: devices, index: index, totalPage: totalPage,
                linePerPage: linePerPage, monthlydate: monthlydate, DevNo: DevNo, datecode: DateCode
            });
        });
    });
});

module.exports = router;
