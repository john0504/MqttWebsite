var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var nodemailer = require('nodemailer');
var cors = require('cors');

var routes = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var machine = require('./routes/machine');
var user = require('./routes/user');
var store = require('./routes/store');
var reg = require('./routes/reg');
var api = require('./routes/api');
var ota = require('./routes/ota');
var payment = require('./routes/payment');
var serial = require('./routes/serial');
var firmware = require('./routes/firmware');

var mailTransport = nodemailer.createTransport(
    {
        host: 'mail.cectco.com',
        port: 587,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: 'cect@cectco.com',
            pass: ''
        }
    });

// DataBase 
var mysql = require("mysql");

var pool = mysql.createPool({
    host: "localhost",
    user: "tywu",
    password: "12345678",
    database: "wawa_db",
    connectionLimit: 100
});

var mysqlQuery = function (sql, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = undefined;
    }
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, options, function (err, results, fields) {
                // callback
                callback(err, results, fields);
            });
            // release connection。
            // 要注意的是，connection 的釋放需要在此 release，而不能在 callback 中 release
            conn.release();
        }
    });
}

//===========================================

var mqtt = require('mqtt');
var fs = require('fs');
var opt = {
    port: 1883,
    clientId: 'CECTCO-nodejs',
    protocol: 'mqtt',
    username: 'ZWN0Y28uY29tMCAXDTE5MDcxODAzMzUyMVoYDzIxMTkwNjI0MDMzNTIxWjBlMQsw',
    password: 'CQYDVQQGEwJUVzEPMA0GA1UECAwGVGFpd2FuMRAwDgYDVQQHDAdIc2luY2h1MQ8w',
    key: fs.readFileSync('./client.key'),
    cert: fs.readFileSync('./client.crt'),
    ca: fs.readFileSync('./ca.crt'),
    rejectUnauthorized: false
};

var client = mqtt.connect('mqtt://localhost', opt);

client.on('connect', function () {
    console.log('MQTT server connected.');
    client.subscribe("WAWA/#");
});

client.on('message', function (topic, msg) {
    var PrjName = topic.substring(0, 4);
    var No = "";
    var action = "";
    var idx = topic.indexOf("/"); //4
    var msgType = "";

    if (topic.substring(idx + 5, idx + 6) == "/") {
        No = topic.substring(idx + 1, idx + 5);
        action = topic.substring(idx + 6);
        msgType = "app";
    } else {
        No = topic.substring(idx + 1, idx + 13);
        action = topic.substring(idx + 14);
        msgType = "device";
    }
    if (action == "C") {
        console.log('get Topic:' + topic);
        //for device const   
        if (msgType == "device") {
            if (msg == "") {
                return;
            }
            mysqlQuery("SELECT * FROM AllowTbl WHERE DevNo = ?", No, function (err, allow) {
                const obj = JSON.parse(msg.toString());
                if (allow.length != 1) {
                    var topic = `${PrjName}/${obj.Account}/M`;
                    var paylod = "此裝置未被授權";
                    client.publish(topic, paylod, { qos: 1, retain: false });
                    return;
                } else {
                    mysqlQuery("SELECT * FROM DeviceTbl WHERE DevNo = ?", No, function (err, device) {
                        if (err) {
                            console.log('[SELECT ERROR] - ', err.message);
                            return;
                        }
                        if (device.length == 0 || device[0].AccountNo == null || device[0].AccountNo == parseInt(obj.Account, 16)) {
                            if (obj.Account == "0000") {
                                return;
                            }
                            var insertsql = {
                                DevNo: No,
                                DevName: obj.DevName,
                                AccountNo: parseInt(obj.Account, 16),
                                PrjName: PrjName,
                                DevAlias: obj.DevAlias,
                                VerNum: obj.VerNum,
                                SaaModel: obj.SaaModel,
                                GroupNo: obj.GroupNo ? obj.GroupNo : null,
                                S01: obj.S01,
                                S02: obj.S02,
                                ExpireDate: allow[0].ExpireDate,
                                CreateDate: Date.now() / 1000,
                            };
                            var updatesql = {
                                DevName: obj.DevName,
                                AccountNo: parseInt(obj.Account, 16),
                                PrjName: PrjName,
                                DevAlias: obj.DevAlias,
                                VerNum: obj.VerNum,
                                SaaModel: obj.SaaModel,
                                GroupNo: obj.GroupNo ? obj.GroupNo : null,
                                S01: obj.S01,
                                S02: obj.S02,
                                UpdateDate: Date.now() / 1000
                            };
                            var sqlstring = "INSERT INTO DeviceTbl SET ? ON DUPLICATE KEY UPDATE ? ";
                            mysqlQuery(sqlstring, [insertsql, updatesql], function (err, result) {
                                if (err) {
                                    console.log('[INSERT ERROR] - ', err.message);
                                    return;
                                }
                                if (device.length == 0 || device[0].AccountNo == null) {
                                    var mytopic = `${PrjName}/${obj.Account}/U`
                                    var mymsg = { action: "list" };
                                    client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: false });
                                }
                            });
                        } else if (device.length != 0 && device[0].AccountNo != null && device[0].AccountNo != parseInt(obj.Account, 16)) {
                            updatesql = {
                                DevName: obj.DevName,
                                VerNum: obj.VerNum,
                                SaaModel: obj.SaaModel,
                                GroupNo: obj.GroupNo ? obj.GroupNo : null,
                                S01: obj.S01,
                                S02: obj.S02,
                                UpdateDate: Date.now() / 1000
                            };
                            sqlstring = "UPDATE DeviceTbl SET ? WHERE DevNo = ?";
                            mysqlQuery(sqlstring, [updatesql, No], function (err, result) {
                                if (err) {
                                    console.log('[UPDATE ERROR] - ', err.message);
                                    return;
                                }
                                var mytopic = `${PrjName}/${obj.Account}/U`
                                var mymsg = { action: "list" };
                                client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: false });
                                // console.log('--------------------------UPDATE----------------------------');
                            });
                            var token = device[0].AccountNo.toString(16);
                            if (token.length == 1) {
                                token = "000" + token;
                            } else if (token.length == 2) {
                                token = "00" + token;
                            } else if (token.length == 3) {
                                token = "0" + token;
                            }
                            var mytopic = `${PrjName}/${No}/D`;
                            var mymsg = { Account: token };
                            client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: false });

                            var topic = `${PrjName}/${obj.Account}/M`;
                            var paylod = "此裝置已在其他帳號上建立裝置";
                            client.publish(topic, paylod, { qos: 1, retain: false });
                        }
                        return;
                    });
                }
            });
        }
    } else if (action == "U") {
        console.log('get Topic:' + topic);
        //for device var
        if (msgType == "device") {
            var arrayBuffer = new ArrayBuffer(msg.length);
            var view = new Uint8Array(arrayBuffer);
            for (var i = 0; i < msg.length; i++) {
                view[i] = msg[i];
            }
            var dataView = new DataView(arrayBuffer);
            var Timestamp = dataView.getUint32(0);
            // console.log("Timestamp:" + Timestamp);
            var obj = {};
            for (i = 4; i < msg.length; i += 3) {
                var service = dataView.getUint8(i);
                var value = dataView.getUint16(i + 1);
                obj["H" + service.toString(16).toUpperCase()] = value;
            }
            var insertsql = {
                DevNo: No,
                H60: obj.H60,
                H61: obj.H61,
                H62: obj.H62,
                H63: obj.H63,
                H64: obj.H64,
                H65: obj.H65,
                H66: obj.H66,
                H67: obj.H67,
                H68: obj.H68,
                H69: obj.H69,
                H6A: obj.H6A,
                H6B: obj.H6B,
                H6C: obj.H6C,
                H6D: obj.H6D,
                H6E: obj.H6E,
                H6F: obj.H6F,
                DateCode: Date.now() / 1000,
                DevTime: Timestamp,
            };
            // console.log(JSON.stringify(insertsql));
            mysqlQuery("INSERT INTO MessageTbl SET ?", insertsql, function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                var updatesql = {
                    UpdateDate: Date.now() / 1000
                };
                var sqlstring = "UPDATE DeviceTbl SET ? WHERE DevNo = ?";
                mysqlQuery(sqlstring, [updatesql, No], function (err, result) {
                    if (err) {
                        console.log('[UPDATE ERROR] - ', err.message);
                        return;
                    }
                });
                // console.log('--------------------------INSERT----------------------------');
            });
        } else if (msgType == "app") {
            // console.log(msg.toString());
            const obj = JSON.parse(msg.toString());
            if (!obj) {
                return;
            }
            if (obj.action == "list") {
                // console.log('get Topic:' + topic + ' & Msg:' + msg.toString());
                var AccountNo = parseInt(No, 16);
                mysqlQuery('SELECT * FROM AccountTbl WHERE AccountNo = ?', AccountNo, function (err, rows) {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    var count = rows.length;
                    if (count == 0) {
                        console.log('Auth fail.');
                        return;
                    } else {
                        if (rows[0].Enable == 0) {
                            console.log('使用者被拒絕存取');
                            return;
                        } else {
                            mysqlQuery('SELECT * FROM DeviceTbl WHERE AccountNo = ?', AccountNo, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                                var count = result.length;
                                var message = { data: [] };
                                var token = AccountNo.toString(16);
                                if (token.length == 1) {
                                    token = "000" + token;
                                } else if (token.length == 2) {
                                    token = "00" + token;
                                } else if (token.length == 3) {
                                    token = "0" + token;
                                }

                                if (count == 0) {
                                    var topic = `${PrjName}/${token}/D`
                                    client.publish(topic, JSON.stringify(message), { qos: 1, retain: false });
                                    return;
                                }

                                for (var i = 0; i < count; i++) {
                                    var device = {
                                        D: result[i].DevNo,
                                        E: result[i].ExpireDate,
                                        U: result[i].UpdateDate
                                    };
                                    message.data.push(device);
                                }
                                var topic = `${PrjName}/${token}/D`
                                client.publish(topic, JSON.stringify(message), { qos: 1, retain: false });
                                return;
                            });
                        }
                    }
                });
            } else if (obj.action == "gifttime") {
                var DevNo = obj.DevNo;
                mysqlQuery('SELECT * FROM MessageTbl WHERE DevNo = ? order by id desc limit 1000', DevNo, function (err, msgs) {
                    var timelist = [];
                    var H62 = 0;
                    var DateCode = 0;
                    msgs.forEach(msg => {
                        if (H62 > msg.H62 && timelist.length < 3) {
                            timelist.push(DateCode);
                        }
                        H62 = msg.H62;
                        DateCode = msg.DateCode;
                    });
                    var mytopic = `${PrjName}/${No}/G`
                    var mymsg = { T: timelist };
                    client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: false });
                });

            } else if (obj.action == "delete") {
                var AccountNo = parseInt(No, 16);
                var DevNo = obj.DevNo;
                mysqlQuery('SELECT * FROM DeviceTbl WHERE AccountNo = ? AND DevNo = ?'
                    , [AccountNo, DevNo], function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        if (result.length == 0) {
                            return;
                        } else {
                            mysqlQuery('UPDATE DeviceTbl SET AccountNo = NULL WHERE DevNo = ?'
                                , result[0].DevNo, function (err, result2) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    var mytopic = `WAWA/${No}/U`
                                    var mymsg = { action: "list" };
                                    client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: false });

                                    var DevNo = result[0].DevNo
                                    var mytopic = `${PrjName}/${DevNo}/D`
                                    var mymsg = { Account: "0000", Owner: No };
                                    client.publish(mytopic, JSON.stringify(mymsg), { qos: 1, retain: true });

                                    var mytopic = `WAWA/${DevNo}/C`
                                    var mymsg = "";
                                    client.publish(mytopic, mymsg, { qos: 1, retain: true });

                                    return;
                                });
                        }
                    });
            }
        }
    } else if (action == "S") {
        //for device status
        var updatesql = {
            UpdateDate: Date.now() / 1000
        };
        var sqlstring = "UPDATE DeviceTbl SET ? WHERE DevNo = ?";
        mysqlQuery(sqlstring, [updatesql, No], function (err, result) {
            if (err) {
                console.log('[UPDATE ERROR] - ', err.message);
                return;
            }
        });
    } else {
        console.log('get Topic:' + topic + " - Don't Care");
    }
});

//===========================================

setInterval(function () {
    var date = new Date(Date.now());
    if (date.getHours() != 1) {
        return;
    }
    console.log("Daily History Start");
    date.setHours(0, 0, 0, 0);
    var timestamp = parseInt(date.getTime() / 1000);
    var pastTimestamp = timestamp - 60 * 60 * 24;
    var sqlstring = "SELECT * FROM MessageTbl WHERE id IN (SELECT MAX(id) from MessageTbl WHERE DateCode >= ? AND DateCode < ? GROUP BY DevNo)";
    mysqlQuery(sqlstring, [pastTimestamp, timestamp], function (err, messages) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        messages.forEach(message => {
            var sqlstring = "SELECT * FROM MessageTbl WHERE DateCode <= ? AND DevNo = ? ORDER BY id desc LIMIT 1";
            mysqlQuery(sqlstring, [pastTimestamp, message.DevNo], function (err, pastMsg) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                var insertSql;
                if (pastMsg.length != 0) {
                    insertSql = {
                        DevNo: message.DevNo,
                        H60: message.H60 - pastMsg[0].H60,
                        H61: message.H61 - pastMsg[0].H61,
                        H62: message.H62 - pastMsg[0].H62,
                        H63: message.H63 - pastMsg[0].H63,
                        H64: message.H64 - pastMsg[0].H64,
                        H65: message.H65 - pastMsg[0].H65,
                        H66: message.H66 - pastMsg[0].H66,
                        H67: message.H67 - pastMsg[0].H67,
                        H68: message.H68 - pastMsg[0].H68,
                        H69: message.H69 - pastMsg[0].H69,
                        H6A: message.H6A - pastMsg[0].H6A,
                        H6B: message.H6B - pastMsg[0].H6B,
                        H6C: message.H6C - pastMsg[0].H6C,
                        H6D: message.H6D - pastMsg[0].H6D,
                        H6E: message.H6E - pastMsg[0].H6E,
                        H6F: message.H6F - pastMsg[0].H6F,
                        DateCode: pastTimestamp
                    };
                } else {
                    insertSql = {
                        DevNo: message.DevNo,
                        H60: message.H60,
                        H61: message.H61,
                        H62: message.H62,
                        H63: message.H63,
                        H64: message.H64,
                        H65: message.H65,
                        H66: message.H66,
                        H67: message.H67,
                        H68: message.H68,
                        H69: message.H69,
                        H6A: message.H6A,
                        H6B: message.H6B,
                        H6C: message.H6C,
                        H6D: message.H6D,
                        H6E: message.H6E,
                        H6F: message.H6F,
                        DateCode: pastTimestamp
                    };
                }
                sqlstring = "INSERT INTO HistoryTbl SET ?"
                mysqlQuery(sqlstring, insertSql, function (err, result) {
                    if (err) {
                        console.log('[INSERT ERROR] - ', err.message);
                        return;
                    }
                });
            });
        });
    });
}, 60 * 60 * 1000);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'cectco mqtt', //secret的值建议使用随机字符串
    cookie: { maxAge: 60 * 1000 * 30 } // 过期时间（毫秒）
}));

// db state
app.use(function (req, res, next) {
    req.mysqlQuery = mysqlQuery;
    req.mailTransport = mailTransport;
    req.mqttClient = client;
    next();
});

app.use(cors());
app.use('/', routes);
app.use('/reg', reg);
app.use('/login', login);
app.use('/logout', logout);
app.use('/machine', machine);
app.use('/store', store);
app.use('/user', user);
app.use('/api:1', api);
app.use('/download/ota/wawa', ota);
app.use('/firmware', firmware);
app.use('/payment', payment);
app.use('/serial', serial);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
