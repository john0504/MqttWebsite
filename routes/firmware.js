var express = require('express'),
    router = express.Router();
var formidable = require('formidable');
var fs = require('fs');

function checkSession(req, res) {
    if (!req.session.Sign || !req.session.SuperUser) {
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
    var mysqlQuery = req.mysqlQuery;

    if (req.session.SuperUser == 1) {
        mysqlQuery('SELECT * FROM FirmwareTbl ', function (err, firmwares) {
            if (err) {
                console.log(err);
            }
            var data = firmwares;
            res.render('firmware', { title: 'Firmware Information', data: data });
        });
    } else {
        res.redirect('/firmware');
    }
});

// add page
router.get('/add', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    res.render('firmwareAdd', { title: 'Add Firmware', msg: '' });
});

// add post
router.post('/firmwareAdd', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var mysqlQuery = req.mysqlQuery;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var OTA = fields.OTA;
        var VerNum = fields.VerNum;
        var sha1 = fields.sha1;
        var url = fields.url;
        var FilePath = files.FilePath.name;
        var newFile = "./" + FilePath;
        fs.readFile(files.FilePath.path, function (err, data) {
            fs.writeFile(newFile, data, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    fs.unlink(files.FilePath.path, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                var sql = {
                    OTA: OTA,
                    VerNum: VerNum,
                    sha1: sha1,
                    url: url,
                    FilePath: FilePath
                };
                mysqlQuery('INSERT IGNORE INTO FirmwareTbl SET ?', sql, function (err, rows) {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect('/firmware');
                    return;
                });
            });
        });
    });


});

router.get('/ota', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var data = {};
    data.DevNo = req.query.DevNo;
    data.VerNumMin = req.query.VerNumMin;
    data.VerNumMax = req.query.VerNumMax;
    var sha1 = req.query.sha1;
    var mysqlQuery = req.mysqlQuery;

    mysqlQuery('SELECT * FROM FirmwareTbl WHERE sha1 = ?', sha1, function (err, fws) {
        if (err) {
            console.log(err);
        }
        data = Object.assign(fws[0], data);
        var sql = 'SELECT * FROM DeviceTbl';
        if (data.DevNo && data.DevNo != '') {
            sql += ` WHERE DevNo LIKE '%${data.DevNo}%'`
            if (data.VerNumMin && data.VerNumMin != 0) {
                sql += ` AND VerNum >= ${data.VerNumMin}`;
            }
            if (data.VerNumMax && data.VerNumMax != 0) {
                sql += ` AND VerNum <= ${data.VerNumMax}`;
            }
        } else if (data.VerNumMin && data.VerNumMin != 0) {
            sql += ` WHERE VerNum >= ${data.VerNumMin}`
            if (data.VerNumMax) {
                sql += ` AND VerNum <= ${data.VerNumMax}`;
            }
        } else if (data.VerNumMax && data.VerNumMax != 0) {
            sql += ` WHERE VerNum <= ${data.VerNumMax}`
        }
        console.log(sql);

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
            res.render('firmwareOta', { title: 'Firmware Ota', data: data, device: devices });
        });
    });
});

router.post('/ota', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var client = req.mqttClient;
    const CheckStart = req.body.CheckStart;
    const Time = req.body.Time;
    const Second = req.body.Second;
    const DevNoList = req.body.chkDevNo;
    const sha1 = req.body.sha1;
    const OTA = req.body.OTA;
    const VerNum = req.body.VerNum;
    const url = req.body.url;

    var timestamp = 0;
    if (Time.length > 0) {
        const year = Time.substring(0, 4);
        const month = Time.substring(4, 6) - 1;
        const day = Time.substring(6, 8);
        const hour = Time.substring(9, 11);
        const minute = Time.substring(11, 13);
        const second = Time.substring(13, 15);
        var myDate = new Date();
        myDate.setFullYear(year, month, day);
        myDate.setHours(hour, minute, second);
        timestamp = parseInt(`${myDate.getTime() / 1000}`, 10);
        console.log(`timestamp:${timestamp}`);
    }
    var paylod = {
        sha1: sha1,
        OTA: OTA,
        VerNum: parseInt(VerNum, 10),
        url: url
    };
    if (CheckStart != 'checked') {
        paylod.RunTime = timestamp;
    }
    if (Array.isArray(DevNoList)) {
        DevNoList.forEach(DevNo => {
            const topic = `WAWA/${DevNo}/D`;
            console.log(`topic:${topic} paylod:${JSON.stringify(paylod)}`);
            client.publish(topic, JSON.stringify(paylod), { qos: 1, retain: false });
            if (paylod.RunTime) {
                paylod.RunTime = parseInt(paylod.RunTime) + parseInt(Second);
            }
        });
    } else if (DevNoList) {
        const topic = `WAWA/${DevNoList}/D`;
        console.log(`topic:${topic} paylod:${JSON.stringify(paylod)}`);
        client.publish(topic, JSON.stringify(paylod), { qos: 1, retain: false });
    }

    res.redirect('/firmware');
});

router.get('/delete', function (req, res, next) {
    if (!checkSession(req, res)) {
        return;
    }
    var sha1 = req.query.sha1;
    var FilePath = req.query.FilePath;
    var mysqlQuery = req.mysqlQuery;
    var oldFile = "./" + FilePath;
    fs.unlink(oldFile, function (err) {
        if (err) {
            console.log(err);
        }
    });
    mysqlQuery('DELETE FROM FirmwareTbl WHERE sha1 = ?', sha1, function (err, rows) {
        if (err) {
            console.log(err);
        }
        res.redirect('/firmware');
    });
});

module.exports = router;