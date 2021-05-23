var Model = require('./db');

var roomConnections = {};

var addUserToRoom = function(socket, name, spec, room){
    socket.userName = name;//setup the user info on the socket
    socket.userSpec = spec;
    socket.userRoom = room;
    //setup the server-side tracking if we're the first person in
    if(roomConnections[room] === undefined)
    {
        roomConnections[room] = {};
        roomConnections[room].anonCount = 0;
        roomConnections[room].sockets = [];
    }
    //name-mangle anon
    if(socket.userName === "Anonymous"){
        socket.userName = "Anonymous"+(++roomConnections[room].anonCount);
    }
    roomConnections[room].sockets.push(socket);
    //generate the list of names and specs
    var usersList = [];
    for(var s of roomConnections[room].sockets){
        usersList.push({userName:s.userName,userSpec:s.userSpec});
    }
    socket.join(room);//subscribe to the room
    //tell the other users we're connecting
    socket.to(socket.userRoom).broadcast.emit("userConnected",{userName:socket.userName, userSpec:socket.userSpec});
    //send the new connection the list of all other users
    socket.emit("usersList",{yourName:socket.userName,list:usersList});
};
var removeUserFromRoom = function(socket){
    socket.to(socket.userRoom).broadcast.emit("userLeft", {userName:socket.userName, userSpec:socket.userSpec});
    if(roomConnections[socket.userRoom] === undefined)
        return console.log("socket '"+socket.userName+"' leaving room '"+socket.userRoom+"' that does not exist in room Connecitons.");
    for(var i = 0; i < roomConnections[socket.userRoom].sockets.length; i++)
    {
        if(roomConnections[socket.userRoom].sockets[i].userName === socket.userName)
        {
            roomConnections[socket.userRoom].sockets.splice(i,1);
            break;
        }
    }
    if(roomConnections[socket.userRoom].sockets.length === 0)
        delete roomConnections[socket.userRoom];
};

var socketSetup = function(io){
    io.on('connection',function(socket){//got a new connection
        
        socket.on('joinRoom',function(userInput){//handle joining a room
            new Model.user({username:userInput.roomName}).fetch().then(function(user){//make sure the room(user)exists
                if(user === null){
                    return socket.emit("serverError","Group not found, unable to connect.");
                }
                addUserToRoom(socket, userInput.userName, userInput.userSpec, userInput.roomName);
                if(user.attributes.groupId === null){//no group data set, take latest upload
                    new Model.fight().where('uploaderId', user.attributes.userId)//select all fights uploaded by user
                    .query(function(qb){qb.max('fightId')})//get the largest fight index
                    .fetch().then(function(pt){//fetch that number
                        if(pt.attributes['max(`fightId`)'] === null)//error checking
                            return socket.emit("serverError", "Unable to find data uploaded by this user.");
                        new Model.fight()//fetch the fight by provided index
                        .where({fightId: pt.attributes["max(`fightId`)"]})
                        .fetch().then(function(fight){
                            socket.emit("loadNewFight", fight.attributes);//send the fight to the client
                        });
                    });
                }//end if groupid === null
                else{
                    new Model.fight().where('fightId', user.attributes.groupId)
                    .fetch().then(function(fight){
                        socket.emit("loadNewFight", fight.attributes);
                    });
                }//end else groupID === null
            });//end group owner lookup
        });//end socket.on(joinRoom)
        socket.on('playstateChange',function(psc){
            socket.to(socket.userRoom).broadcast.emit("playstateChange", {isPlaying:psc.isPlaying,
                 time:psc.time, userName:socket.userName, userSpec:socket.userSpec});
        });//end socket.onjoinRoom
        socket.on('disconnect',function(){
            removeUserFromRoom(socket);
        });
    });//end io.on(connection)
};//end socketSetup()


module.exports = socketSetup;