var express = require('express'),
    router = express.Router();

router.get('/B02376B487A4E0797A65A40AE6956FDC.txt', function (req, res) {
    var fs = require('fs');
    var file = fs.readFileSync(`./B02376B487A4E0797A65A40AE6956FDC.txt`);
    res.status(200).send(file.toString());
    return;
});

module.exports = router;