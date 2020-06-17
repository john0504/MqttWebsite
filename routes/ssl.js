var express = require('express'),
    router = express.Router();

router.get('/7CF32140CC7EB30A27687FAA2A9FD497.txt', function (req, res) {
    var fs = require('fs');
    var file = fs.readFileSync(`./7CF32140CC7EB30A27687FAA2A9FD497.txt`);
    res.status(200).send(file.toString());
    return;
});

module.exports = router;