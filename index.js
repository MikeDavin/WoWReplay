var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var path = require('path');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var ejs = require('ejs');
//var monitor = require('monitor').start();

var Model = require('./db.js');
var route = require("./routes.js");


var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mySockets = require('./socketSetup.js')(io);

passport.use(new localStrategy(function(username, password, done){
    new Model.user({username:username}).fetch().then(function(data){
        var user = data;
        if(user === null)
            return done(null, false, {message: 'invalid username or password'});
        else
        {
            user = data.toJSON();
            if(!bcrypt.compareSync(password, user.userPassword))
                return done(null, false, {message:'invalid username or password'});
            else
                return done(null, user);
        }
    });
}));
passport.serializeUser(function(user, done){
    done(null, user.username);
});
passport.deserializeUser(function(username, done){
    new Model.user({username:username}).fetch().then(function(user){
        done(null, user);
    });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true,
    limit:4*1000*1000}));
app.use(session({secret: bcrypt.genSaltSync(),
    resave:false,
    saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('./static'));

app.get('/', route.index);
app.get('/replay', route.fightFromFile);
app.get('/splitLog', route.splitLog);
app.get('/liveLog', route.liveLog);
app.get('/uploadLog', route.uploadLog);
app.get('/logIn', route.logIn);
app.get('/createAccount', route.signUp);
app.get('/logOut', route.logOut);
app.get('/users', route.usersList);

app.post('/createAccount',route.signUpPost);
app.post('/logIn', route.logInPost);
app.post('/uploadFight', route.uploadFightPostClosure(io));
app.post('/setGroup/:fightId', route.setGroupPostClosure(io));


app.get('/users/:userName', route.userProfile);
app.get('/replay/:userId-:fightId', route.fightFromServer);
app.get('/data/:userId-:fightId', route.loadFight);
app.get('/group/:userName', route.groupView);

app.use(route.notFound404);
http.listen(80, function(){
	console.log("listening!");
});