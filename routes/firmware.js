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