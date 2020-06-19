var express = require('express'),
    router = express.Router();

router.get('/3A936113977ADA5B1899990B3013EE24.txt', function (req, res) {
    var fs = require('fs');
    var file = fs.readFileSync(`./3A936113977ADA5B1899990B3013EE24.txt`);
    res.status(200).send(file.toString());
    return;
});

module.exports = router;