var express = require('express'),
    router = express.Router();

router.get('/az', function (req, res) {
    req.setTimeout(60 * 1000);
    res.setTimeout(60 * 1000);
    var mysqlQuery = req.mysqlQuery;
    var DevNo = req.headers["devno"];
    var sha1 = req.headers["sha1"];

    mysqlQuery("SELECT * FROM AllowTbl WHERE DevNo = ?", DevNo, function (err, device) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if (device && device.length > 0) {
            mysqlQuery("SELECT * FROM FirmwareTbl WHERE sha1 = ?", sha1, function (err, firmware) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                if (firmware && firmware.length > 0) {
                    var fs = require('fs');
                    res.status(200).send(fs.readFileSync(`./${firmware[0].FilePath}`));
                }
            });
        }
    });
    return;
});

router.get('/azz', function (req, res) {
    req.setTimeout(60 * 1000);
    res.setTimeout(60 * 1000);
    var mysqlQuery = req.mysqlQuery;
    var sha1 = req.query["sha1"];

    mysqlQuery("SELECT * FROM FirmwareTbl WHERE sha1 = ?", sha1, function (err, firmware) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        if (firmware && firmware.length > 0) {
            var fs = require('fs');
            res.status(200).send(fs.readFileSync(`./${firmware[0].FilePath}`));
        }
    });
});

module.exports = router;