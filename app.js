var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var nodemailer = require('nodemailer');

var routes = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var machine = require('./routes/machine');
var user = require('./routes/user');
var store = require('./routes/store');
var reg = require('./routes/reg');
var api = require('./routes/api');
var payment = require('./routes/payment');

var mailTransport = nodemailer.createTransport(
    {
        host: 'mail.cectco.com',
        port: 587,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: 'cect@cectco.com',
            pass: 'p0yL.jws06)~'
        }
    });

// DataBase 
var mysql = require("mysql");

var pool = mysql.createPool({
    host: "localhost",
    user: "tywu",
    password: "12345678",
    database: "mqtt_DB",
    connectionLimit: 1000
});

var mysqlQuery = function(sql, options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = undefined;
    }
    pool.getConnection(function(err, conn){
        if (err) {
            callback(err, null, null);
        } else {
            conn.query(sql, options, function(err, results, fields){
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
var opt = {
    port: 1883,
    clientId: 'nodejs'
};

var client = mqtt.connect('mqtt://localhost', opt);

client.on('connect', function () {
    console.log('MQTT server connected.');
    client.subscribe("TENX/+/+/status_up");
    client.subscribe("CECT/+/+/device_create");
    client.subscribe("CECT/alldevice");
    client.subscribe("CECT/updatedevice");
});

client.on('message', function (topic, msg) {
    console.log('get Topic:' + topic + ' & Msg:' + msg.toString());
    var index = topic.indexOf("device_create");

    
    if (index != -1 || topic.indexOf("status_up") != -1) {
        const obj = JSON.parse(msg.toString());

        var sql = {
            totalmoney: obj.totalmoney,
            totalgift: obj.totalgift,
            // bank: obj.bank,
            money: obj.money,
            gift: obj.gift,
            serial: obj.serial,
            date: Date.now(),
        };

        var addmoney = 0;
        var addgift = 0;
        var addbank = 0;
        
        mysqlQuery("SELECT * FROM mqtt_client WHERE serial = ? ORDER BY id DESC LIMIT 1", sql.serial, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
            }
            if (result != '' && 
                result[0].totalmoney == sql.totalmoney &&
                result[0].totalgift == sql.totalgift &&
                result[0].money == sql.money &&
                result[0].gift == sql.gift) {                
                console.log('--------------------Superfluous Data----------------------');                       
            } else {
                if (result != '') {
                    addmoney = sql.money - result[0].money;
                    addgift = sql.gift - result[0].gift;
                    addbank = addgift > 0 ? 0 : addmoney; 
                }

                mysqlQuery("INSERT INTO mqtt_client SET ?", sql, function (err, result) {
                    if (err) {
                        console.log('[SELECT ERROR] - ', err.message);
                        return;
                    }
                    console.log('--------------------------INSERT----------------------------');
                });
            }
            var sqlstring = "INSERT INTO mqtt_machine SET ? ON DUPLICATE KEY UPDATE ? ";
            var insertsql = {
                totalmoney: obj.totalmoney,
                totalgift: obj.totalgift,
                // bank: obj.bank,
                money: obj.money,
                gift: obj.gift,
                name: obj.name,
                serial: obj.serial,
                type: obj.typename,
                lat: obj.lat,
                lng: obj.lng,
                // expiredate: ???,
                createdate: Date.now()
            };
            var updatesql = {
                totalmoney: obj.totalmoney,
                totalgift: obj.totalgift,
                updatedate: Date.now()
            };
            if (addgift > 0) {
                updatesql.bank = 0;
            } else {
                sqlstring = sqlstring + ", bank = bank + " + addbank;
            }
            sqlstring = sqlstring + ", money = money + " + addmoney;
            sqlstring = sqlstring + ", gift = gift + " + addgift;
            mysqlQuery(sqlstring, [insertsql, updatesql], function (err, result) {
                if (err) {
                    console.log('[SELECT ERROR] - ', err.message);
                    return;
                }
                console.log('--------------------------UPDATE----------------------------');
            });
        });
    }

    index = topic.indexOf("alldevice");

    if (index != -1) {
        const obj = JSON.parse(msg.toString());
        var account = obj.account;
        //var token = obj.token;
        mysqlQuery('SELECT * FROM mqtt_user WHERE account = ?', account, function (err, rows) {
            if (err) {
                console.log(err);
                return;
            }
    
            var count = rows.length;
            if (count == 0) {
                console.log('Auth fail.');
                return;
            } else {
                if (rows[0].enable == 0) {
                    console.log('使用者被拒絕存取');
                    return;
                } else {
                    mysqlQuery('SELECT * FROM mqtt_machine WHERE account = ?', account, function (err, result) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        var count = result.length;
                        var message = { data: [] };
    
                        for (var i = 0; i < count; i++) {
                            var device = {
                                name: result[i].name,
                                serial: result[i].serial,
                                type: result[i].type,
                                bank: result[i].bank,
                                money: result[i].money,
                                gift: result[i].gift,
                                // expiredate: result[i].expiredate,
                                status: Date.now() - result[i].updatedate < 5 * 60 * 1000 ? 1 : 0
                            };
                            message.data.push(device);
                        }
                        var topic = `CECT/${account}/alldevice`
                        console.log(`${topic}:${JSON.stringify(message)}`);
                        client.publish(topic, JSON.stringify(message), { qos:1, retain: true});
                        return;
    
                    });
                }
            }
        });
    }

    index = topic.indexOf("updatedevice");
    if (index != -1) {
        const obj = JSON.parse(msg.toString());
        var account = obj.account;
        var serial = obj.serial;
        var data = obj.data;
        mysqlQuery('SELECT * FROM mqtt_user WHERE account = ?', account, function (err, rows) {
            if (err) {
                console.log(err);
                return;
            }
    
            var count = rows.length;
            if (count == 0) {
                console.log('Auth fail.');
                return;
            } else {
                if (rows[0].enable == 0) {
                    console.log('使用者被拒絕存取');
                    return;
                } else {
                    mysqlQuery('SELECT * FROM mqtt_machine WHERE account = ? AND serial = ?'
                        , [account, serial], function (err, result) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            mysqlQuery('UPDATE mqtt_machine SET ? WHERE id = ?'
                                , [data, result[0].id], function (err, result2) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    console.log(err);
                                    return;
                                });
                        });
                }
            }
        });
    }    
});

//===========================================
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

app.use('/', routes);
app.use('/reg', reg);
app.use('/login', login);
app.use('/logout', logout);
app.use('/machine', machine);
app.use('/store', store);
app.use('/user', user);
app.use('/api:1', api);
app.use('/payment', payment);


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
