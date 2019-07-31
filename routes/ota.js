var express = require('express'),
    router = express.Router();

router.get('/az', function (req, res) {
    var mysqlQuery = req.mysqlQuery;
    var DevNo = req.headers["devno"];
    var sha1 = req.headers["sha1"];

    mysqlQuery("SELECT * FROM DeviceTbl WHERE DevNo = ?", DevNo, function (err, device) {
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

module.exports = router;