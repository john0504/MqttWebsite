var express = require('express'),
    router = express.Router();

router.get('/32C017A8FF7A9BB97E4499DFB268FD7E.txt', function (req, res) {
    var fs = require('fs');
    var file = fs.readFileSync(`./32C017A8FF7A9BB97E4499DFB268FD7E.txt`);
    res.status(200).send(file.toString());
    return;
});

module.exports = router;