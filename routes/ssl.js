var express = require('express'),
    router = express.Router();

router.get('/sCFbhAUFN_BUU0yOz83hc4CDDoXs0vzTOV7Qc5dt5SQ', function (req, res) {
    var fs = require('fs');
    var file = fs.readFileSync(`./sCFbhAUFN_BUU0yOz83hc4CDDoXs0vzTOV7Qc5dt5SQ`);
    res.status(200).send(file.toString());
    return;
});

module.exports = router;