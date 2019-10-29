var express = require('express'),
    router = express.Router();

router.get('/WoutOVDroQgv22qEjzx-zU8vhGHYmjHf1ddJiofHoKM', function (req, res) {
    var fs = require('fs');
    var file = fs.readFileSync(`./WoutOVDroQgv22qEjzx-zU8vhGHYmjHf1ddJiofHoKM`);
    res.status(200).send(file.toString());
    return;
});

module.exports = router;