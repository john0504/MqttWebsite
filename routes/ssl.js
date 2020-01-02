var express = require('express'),
    router = express.Router();

router.get('/UuqvsqaBKnm86e7B82m8yBjNYaXlqNpGvHeo9LKRsz4', function (req, res) {
    var fs = require('fs');
    var file = fs.readFileSync(`./UuqvsqaBKnm86e7B82m8yBjNYaXlqNpGvHeo9LKRsz4`);
    res.status(200).send(file.toString());
    return;
});

module.exports = router;