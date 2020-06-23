var express = require('express'),
    router = express.Router();

router.get('/E421C5894DBB5F667F498F52C2BF9F83.txt', function (req, res) {
    var fs = require('fs');
    var file = fs.readFileSync(`./E421C5894DBB5F667F498F52C2BF9F83.txt`);
    res.status(200).send(file.toString());
    return;
});

module.exports = router;