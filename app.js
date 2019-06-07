var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var machine = require('./routes/machine');
var user = require('./routes/user');
var store = require('./routes/store');
var reg = require('./routes/reg');

// DataBase 
var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "tywu",
    password: "12345678",
    database: "mqtt_DB"
});

function disconnect_handler() {
    con.connect(err => {
        (err) && setTimeout('disconnect_handler()', 2000);
    });
	
    console.log('connecting success');

    con.on('error', err => {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            // db error reconnect
    	    console.log('reconnecting...');
            disconnect_handler();
        } else {
            throw err;
        }
    });
}
/*
con.connect(function(err) {
    if (err) {
        console.log('connecting error');
        return;
    }
    console.log('connecting success');
});
*/


//===========================================

var mqtt = require('mqtt');
var opt = {
	port:1883,
	clientId: 'nodejs'
};

var client = mqtt.connect('mqtt://localhost', opt);
 
client.on('connect', function () {
	console.log('MQTT server connected.');
	client.subscribe("TENX/+/+/status_up");
});

client.on('message', function (topic, msg) { 
    console.log('get Topic:' + topic + ' & Msg:' + msg.toString());
    
	const obj = JSON.parse(msg.toString());	

    var sql = {
        totalmoney: obj.totalmoney,
        totalgift: obj.totalgift,
        money: obj.money,
        gift: obj.gift,
        serial: obj.serial,
        date: Date.now(),
    };

    con.query("SELECT * FROM mqtt_client WHERE serial = ? ORDER BY id DESC LIMIT 1", sql.serial, function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
          }
          if(result != '') {
              if (result[0].totalmoney == sql.totalmoney &&
                result[0].totalgift == sql.totalgift &&
                result[0].money == sql.money &&
                result[0].gift == sql.gift) {
                    console.log('--------------------Superfluous Data----------------------');
                    return;                    
              }
        }
          con.query("INSERT INTO mqtt_client SET ?", sql, function (err, result) {
            if(err){
                console.log('[SELECT ERROR] - ',err.message);
                return;
              }
              console.log('--------------------------INSERT----------------------------');      
              console.log('INSERT ID:',result);        
              console.log('-----------------------------------------------------------------\n\n');  
        });
    });		

    var insertsql = {
        totalmoney: obj.totalmoney, 
        totalgift: obj.totalgift,
        money: obj.money,
        gift: obj.gift,
        name: obj.name,
        serial: obj.serial,
        type: obj.typename,
        lat: obj.lat,
        lng: obj.lng,
        createdate: Date.now()    
    };
    var updatesql = {
        totalmoney: obj.totalmoney, 
        totalgift: obj.totalgift,
        money: obj.money,
        gift: obj.gift,
        updatedate: Date.now()
    };
    con.query("INSERT INTO mqtt_machine SET ? ON DUPLICATE KEY UPDATE ?",[insertsql,updatesql],function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        console.log('--------------------------UPDATE----------------------------');      
        console.log('UPDATE ID:',result);        
        console.log('-----------------------------------------------------------------\n\n');  
    });     
});

//===========================================
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'cectco mqtt', //secret的值建议使用随机字符串
    cookie: {maxAge: 60 * 1000 * 30} // 过期时间（毫秒）
}));

// db state
app.use(function(req, res, next) {
    req.con = con;
    next();
});

app.use('/', routes);
app.use('/reg', reg);
app.use('/login', login);
app.use('/logout', logout);
app.use('/machine', machine);
app.use('/store', store);
app.use('/user', user);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
