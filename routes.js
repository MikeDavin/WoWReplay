var passport = require("passport");
var bcrypt = require("bcrypt-nodejs");
var Model = require("./db");
var winston = require('winston');

winston.add(winston.transports.File, {filename:'404.log'});
winston.remove(winston.transports.Console);
winston.log('info', 'log hello world');
var classList = [];
var imgPath = "/icons/playerClass/";
classList.push({ img: imgPath + "DeathknightBlood" + ".png", color: "#C41F3B" });
classList.push({ img: imgPath + "DeathknightFrost" + ".png", color: "#C41F3B" });
classList.push({ img: imgPath + "DeathknightUnholy" + ".png", color: "#C41F3B" });
classList.push({ img: imgPath + "DemonhunterHavoc" + ".png", color: "#A330C9" });
classList.push({ img: imgPath + "DemonhunterVengeance" + ".png", color: "#A330C9" });
classList.push({ img: imgPath + "DruidBalance" + ".png", color: "#FF7D0A" });
classList.push({ img: imgPath + "DruidFeral" + ".png", color: "#FF7D0A" });
classList.push({ img: imgPath + "DruidGuardian" + ".png", color: "#FF7D0A" });
classList.push({ img: imgPath + "DruidRestoration" + ".png", color: "#FF7D0A" });
classList.push({ img: imgPath + "HunterBeastmastery" + ".png", color: "#ABD473" });
classList.push({ img: imgPath + "HunterMarksman" + ".png", color: "#ABD473" });
classList.push({ img: imgPath + "HunterSurvival" + ".png", color: "#ABD473" });
classList.push({ img: imgPath + "MageArcane" + ".png", color: "#69CCF0" });
classList.push({ img: imgPath + "MageFire" + ".png", color: "#69CCF0" });
classList.push({ img: imgPath + "MageFrost" + ".png", color: "#69CCF0" });
classList.push({ img: imgPath + "MonkBrewmaster" + ".png", color: "#00FF96" });
classList.push({ img: imgPath + "MonkMistweaver" + ".png", color: "#00FF96" });
classList.push({ img: imgPath + "MonkWindwalker" + ".png", color: "#00FF96" });
classList.push({ img: imgPath + "PaladinHoly" + ".png", color: "#F58CBA" });
classList.push({ img: imgPath + "PaladinProtection" + ".png", color: "#F58CBA" });
classList.push({ img: imgPath + "PaladinRetribution" + ".png", color: "#F58CBA" });
classList.push({ img: imgPath + "PriestDicipline" + ".png", color: "#FFFFFF" });
classList.push({ img: imgPath + "PriestHoly" + ".png", color: "#FFFFFF" });
classList.push({ img: imgPath + "PriestShadow" + ".png", color: "#FFFFFF" });
classList.push({ img: imgPath + "RogueAssassination" + ".png", color: "#FFF569" });
classList.push({ img: imgPath + "RogueOutlaw" + ".png", color: "#FFF569" });
classList.push({ img: imgPath + "RogueSubtlety" + ".png", color: "#FFF569" });
classList.push({ img: imgPath + "ShamanElemental" + ".png", color: "#0070DE" });
classList.push({ img: imgPath + "ShamanEnhancement" + ".png", color: "#0070DE" });
classList.push({ img: imgPath + "ShamanRestoration" + ".png", color: "#0070DE" });
classList.push({ img: imgPath + "WarlockAffliction" + ".png", color: "#9482C9" });
classList.push({ img: imgPath + "WarlockDemonology" + ".png", color: "#9482C9" });
classList.push({ img: imgPath + "WarlockDestruction" + ".png", color: "#9482C9" });
classList.push({ img: imgPath + "WarriorArms" + ".png", color: "#C79C6E" });
classList.push({ img: imgPath + "WarriorFury" + ".png", color: "#C79C6E" });
classList.push({ img: imgPath + "WarriorProtection" + ".png", color: "#C79C6E" });

var consoleLog = function(str, startTime){
    var now = new Date();
    var dur = "";
    if(startTime)
        dur = " "+((now-startTime)/1000).toPrecision(3) +'s';
    console.log(now.toLocaleTimeString()+" "+str+dur);
};


var index = function (req, res) {
    consoleLog("index");
    res.render('index', { serverMessage: renderServerMessage(req), authenticate: generateAuthHtml(req) });
};

var logIn = function (req, res) {
    res.render('login', { serverMessage: renderServerMessage(req) });
};
var logInPost = function (req, res, next) {
    consoleLog("login - "+req.body.username);
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return res.render('login', { serverMessage: renderServerMessage("Login Error: " + err.message) });
        }
        if (!user) {//invalid ussername/password, missing credentials
            return res.render('login', { serverMessage: renderServerMessage("Login Error: " + info.message) });
        }

        return req.logIn(user, function (err) {
            if (err) {
                return res.render('login', { serverMessage: renderServerMessage("Login Error: " + err.message) });
            }
            else {//everything worked
                req.session.serverMessage = "Welcome " + req.user.username + ".";
                return res.redirect('/');
            }
        });
    })(req, res, next);
};

var signUp = function (req, res) {
    res.render('signup', { serverMessage: renderServerMessage(req) });
};
var signUpPost = function (req, res, next) {
    consoleLog("signup - "+req.body.username);
    var user = req.body;
    var usernamePromise = new Model.user({ username: user.username }).fetch();

    return usernamePromise.then(function (model) {
        var fakeReq = {};
        fakeReq.session = {};
        fakeReq.session.serverMessage = "";
        if (model || user.username.toLowerCase().startsWith("anonymous")) {
            
            res.render('signup', { serverMessage: renderServerMessage("Username already exists.") });
        }
        else {
            var specIndex = parseInt(user.spec);
            if (user.username.length < 2 || user.username.length > 20 ||
                user.password.length < 6 || user.password.length > 50 ||
                specIndex < 0 || specIndex > 35 || Number.isNaN(specIndex))
                return res.render('signup', { serverMessage: renderServerMessage("Error with username, password, or spec.") });
            if (user.ageCheck === undefined)
                return res.render('signup', { serverMessage: renderServerMessage("You must be at least 13 years old to create an account.") });
            for (var c of user.username) {
                c = c.charCodeAt(0);
                if (!((c >= 97 && c <= 122) ||//a-z
                    (c >= 65 && c <= 90) ||//A-Z
                    (c >= 48 && c <= 57)))//0-9
                {
                    return res.render('signup', { serverMessage: renderServerMessage("Invalid character in username") });
                }
            }
            var signUpUser = new Model.user({
                username: user.username,
                userPassword: bcrypt.hashSync(user.password),
                spec: parseInt(user.spec)
            });
            signUpUser.save().then(function (model) {
                req.session.serverMessage = "Account created, please log in.";
                res.redirect("/logIn");
            },
                function (reason) {
                    return res.render('signup', { serverMessage: renderServerMessage("Account creation failure: " + reason) });
                });
        }
    });
};

var logOut = function (req, res, next) {
    if (req.isAuthenticated()) {
        req.logout();
        req.session.serverMessage = "Logged out.";
    }
    res.redirect("/");
};

var generateAuthHtml = function (req) {
    if (req.isAuthenticated()) {
        var u = req.user.attributes;
        return "<div class='btn-group pull-right'>" +
            "<a href='/users/" + u.userName + "'><button type='button' class='btn btn-defaul userAccount'" +
            "style='border-color:" + classList[u.spec].color + "'>" +
            "<img src='" + classList[u.spec].img +
            "' style='height:1.5em;'> " + u.userName + "</button></a>" +
            "<a href='/logOut'><button type='button' class='btn btn-defaul'>Log out</button></a></div>";
    }
    else {
        return "<div class='btn-group pull-right'>" +
            "<a href='/logIn'><button type='button' class='btn btn-defaul'>Log In</button></a>" +
            "<a href='/createAccount'><button type='button' class='btn btn-defaul'>Create Account</button></a></div>"
    }
};
var renderServerMessage = function (req) {
    var tmp;
    if(typeof req === 'string' )//req can either be a req, or a string, this is the string case
        tmp = req;
    else if (req.session.serverMessage === undefined || req.session.serverMessage === "")
        return "";
    else{
        tmp = req.session.serverMessage;
        req.session.serverMessage = "";
    }
    return "<div class='alert alert-success'>" + tmp + "</div>";
};

var splitLog = function (req, res) {
    consoleLog("split");
    res.render('splitLog', { authenticate: generateAuthHtml(req) });
};
var uploadLog = function (req, res) {
    consoleLog("upload");
    if (req.isAuthenticated()) {
        res.render('uploadLog', { authenticate: generateAuthHtml(req) });
    }
    else {
        req.session.serverMessage = "Please login to upload data."
        res.redirect("/login");
    }
};
var liveLog = function (req, res) {
    consoleLog("livelog");
    if (req.isAuthenticated()) {
        res.render('liveLog', { authenticate: generateAuthHtml(req) });
    }
    else {
        req.session.serverMessage = "Please login to upload data."
        res.redirect("/login");
    }
};
var uploadFightPostClosure = function (io) {
    
    return function (req, res) {
        consoleLog("uploadData");
        if (!req.isAuthenticated()) {
            return res.status(201).send("User not authenticated, unable to upload data.");
        }
        var bodyData = "";
        req.on('data', function (data) {
            bodyData += data;
        });
        req.on('end', function () {
            bodyData = decodeURI(bodyData);
            try{bodyData = JSON.parse(bodyData);}
            catch(e){return res.status(406).send("Upload failed: Unable to parse data.")}
            
            bodyData.uploaderId = req.user.id;
            new Model.fight().save(bodyData).then(function (model) {
                req.user.save({ groupId: null }, { patch: true }).then(function (s) {
                    io.to(req.user.attributes.userName).emit("loadNewFight", model.attributes);
                    res.status(201).send("Upload Successful");
                }, function (f) {
                    res.status(201).send("Uploaded Successful, but group not updated.");
                });
            }, function (err) {
                res.status(500).send("Upload failed: " + err.code);
            }
            );
        });
    };
};

var usersList = function (req, res) {
    var start = new Date();
    new Model.user()
        .query(function (qb) { qb.orderBy('userName', 'ASC') })
        .fetchAll().then(function (users) {
            var us = "";
            for (var ui = 0; ui < users.models.length; ui++) {
                var user = users.models[ui].attributes;
                us += "<div class='col-md-4'><a class='btn btn-default btn-md user' style='border-color:"+classList[user.spec].color+
                    ";' href='/users/" + user.userName + "'><img style='height:2.5em;'src='" +
                     classList[user.spec].img + "'/> <b>" + user.userName + "</b></a></div>"
            }
            consoleLog("users", start);
            return res.render('users', { users: us, authenticate: generateAuthHtml(req) });
        });
};
var userProfile = function (req, res) {
    var start = new Date();
    new Model.user({ username: req.params.userName }).fetch().then(function (user) {
        if (user === null) {
            req.session.serverMessage = "User '" + req.params.userName + "' not found.";
            return res.redirect('/');
        }
        var colsToSelect = ['fightId', 'encounterName', 'difficulty', 'raidSize', 'pullTime', 'won', 'duration']
        new Model.fight().where('uploaderId', user.attributes.userId)
            .query(function (qb) { qb.orderBy('pullTime', 'ASC'); })
            .fetchAll({ 'columns': colsToSelect }).then(function (fights) {
                renderUserProfile(req, res, user.attributes, fights.models, start);
            });
    });
};
var renderUserProfile = function (req, res, user, fights, startTime) {
    var fs = "";
    var curDate = null;
    var panels = [];
    //for (var f of fights) {
    for(var i = 0; i < fights.length; i++){

        var f = fights[i].attributes;
        var p = f.pullTime;
        if (p.getDate() !== curDate) {
            if(curDate !== null){
                fs += "</div></div></div>"
                panels.push(fs);
            }
            
            fs = "<div class='panel panel-default'><div class='panel-heading'>"
                +"<a data-toggle='collapse' href='#collapse"+panels.length+"'>"+"<div class='panel-title'>"
                + p.toDateString() + "</div></a></div><div class='panel-collapse' id='collapse"//class='panel-collapse collapse' to go back to hidden by default
                + panels.length+"'><div class='panel-body'>";
            curDate = p.getDate();
        }

        var pts = p.getMinutes();
        if (pts < 10)
            pts = "0" + pts;
        pts = p.getHours() + ":" + pts;

        var diff = f.difficulty;
        if (diff === 0)
            diff = "LFR";
        else if (diff === 1)
            diff = "Normal";
        else if (diff === 2)
            diff = "Heroic";
        else if (diff === 3)
            diff = "Mythic";
        diff += "(" + f.raidSize + ")"

        var dur = new Date(f.duration);
        var durStr = dur.getMinutes() + ":" + (dur.getSeconds() < 10 ? "0" : "") + dur.getSeconds();


        fs += pts +" <a href='/replay/" + user.userId + "-" + f.fightId + "'>"+ " <button class='btn btn-xs btn-"+(f.won?"success":"danger")+"'>";
        fs += f.encounterName + " " + diff;
        fs += " " + durStr;
        fs += (f.won) ? "" : " Wipe";
        fs += "</button></a><br>";
    }
    panels.push(fs+"</div></div></div>");
    fs = "";
    for(var i = 1; i <= panels.length; i++ )
        fs += panels[panels.length-i];
    consoleLog("user("+user.username+")", startTime);
    res.render('userProfile', { username: user.username, color:classList[user.spec].color,
        icon:classList[user.spec].img, authenticate: generateAuthHtml(req), fights: fs });
};


var loadFight = function (req, res) {
    var errorString = "SERVERERROR = 'Error: Data not found.';";
    new Model.user({ userId: req.params.userId }).fetch().then(function (user) {
        if (user === null) {
            return res.send(errorString);
        }
        new Model.fight({ fightId: req.params.fightId }).fetch({ 'columns': ['data', 'uploaderId'] }).then(function (fight) {
            if (fight === null || fight.attributes.uploaderId !== user.attributes.userId) {
                return res.send(errorString);
            }
            return res.send('SERVERDATA = "' + fight.attributes.data + '";');
        });
    });
};
var fightFromServer = function (req, res) {
    consoleLog("fight - server("+req.params.userId+"-"+req.params.fightId+")");
    var setGroup = "";
    if (req.isAuthenticated()) {
        setGroup = "<input type='button' id='setGroupViewButton' onclick='setGroupAjax(" + req.params.fightId + ");' value='Set as your group view'</input>";
    }

    res.render('soloView', {
        fightData: "<script src='/data/" + req.params.userId + "-" + req.params.fightId + "'></script>",
        fileSelect: setGroup
    });
};
var fightFromFile = function (req, res) {
    consoleLog("fight - file");
    res.render('soloView', {
        fightData: "",
        fileSelect: "<label class='btn btn-default btn-sm'>Load File"
            +"<input type='file' style='display:none;' onchange='handleFileSelect(this.files)' id='fileID'></label>"
    });
};
var groupView = function (req, res) {
    consoleLog("group("+req.params.userName+")");
    var clientJsString = "<script>ROOMNAME='" + req.params.userName + "';";
    if (req.user) {
        clientJsString += "USERNAME='" + req.user.attributes.userName + "';";
        clientJsString += "USERSPEC=" + req.user.attributes.spec + ";</script>";
    }
    else {
        clientJsString += "USERNAME='Anonymous';USERSPEC=-1;</script>";
    }
    clientJsString += "<script src='/socket.io/socket.io.js'></script>";
    clientJsString += "<script src='/scripts/lib/message.js'></script>";
    clientJsString += "<script src='/scripts/groupView.js'></script>";
    clientJsString += "<link rel='stylesheet' type='text/css' href='/styles/message_solid.css'>";
    res.render('soloView', { fightData: clientJsString, fileSelect: "" });
};
var setGroupPostClosure = function (io) {
    return function (req, res) {
        if (!req.isAuthenticated())
            return res.status(401).send("Error: Not authenticated.");
        req.user.save({ groupId: req.params.fightId }, { patch: true }).then(function (model) {
            new Model.fight({ fightId: req.params.fightId }).fetch().then(function (fight) {
                io.to(req.user.attributes.userName).emit("loadNewFight", fight.attributes);
                return res.status(202).send("Updated");
            }, function (error) {
                return res.status(500).send("Error: Unable to retrieve fight.");
            });

        }, function (error) {
            return res.status(500).send("Error: Unalbe to update DB.");
        });
    };
};

var notFound404 = function (req, res) {
    if(req.url.startsWith('/icons/spell/'))
        winston.log('info', 'missing image: '+req.url.substr(13));
     res.status(404).render('404', { title: "404 not found" }); 
};

module.exports.index = index;
module.exports.fightFromFile = fightFromFile;
module.exports.splitLog = splitLog;
module.exports.liveLog = liveLog;
module.exports.uploadLog = uploadLog;
module.exports.logIn = logIn;
module.exports.logInPost = logInPost;
module.exports.signUp = signUp;
module.exports.signUpPost = signUpPost;
module.exports.logOut = logOut;
module.exports.notFound404 = notFound404;
module.exports.userProfile = userProfile;
module.exports.loadFight = loadFight;
module.exports.fightFromServer = fightFromServer;
module.exports.uploadFightPostClosure = uploadFightPostClosure;
module.exports.groupView = groupView;
module.exports.usersList = usersList;
module.exports.setGroupPostClosure = setGroupPostClosure;