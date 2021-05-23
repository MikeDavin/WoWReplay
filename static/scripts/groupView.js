var socket;


var initSharedRoom = function()
{
    var usersList = [];
    if(typeof ROOMNAME === 'undefined')
        return document.getElementById("errorOutput").innerHTML = "Error: Room name missing.";
    socket = io('/');
    socket.emit("joinRoom",{roomName:ROOMNAME, userName:USERNAME, userSpec:USERSPEC});

    socket.on("serverError", function(msg){
        document.getElementById("errorOutput").innerHTML = "Server Error: "+msg;
    });

    socket.on("loadNewFight", function(fightRow){
        document.getElementById("fightName").innerHTML = fightRow.encounterName;
        readDataAndSetup(fightRow.data,true);
    });

    socket.on("userConnected", function(newUser){
        var notification = "<img style='height:1.5em;' src='"+playerClassList[newUser.userSpec].icon.src+"'>"+newUser.userName;
        dhtmlx.message({text:notification+" connected."});
        usersList.push(newUser);
        updateUsersPopup(usersList);
    });

    socket.on("userLeft", function(user){
        var notification = "<img style='height:1.5em;' src='"+playerClassList[user.userSpec].icon.src+"'>"+user.userName;
        dhtmlx.message({text:notification+" left."});
        for(var i = 0; i < usersList.length; i++)
        {
            if(usersList[i].userName === user.userName)
            {
                usersList.splice(i,1);
                break;
            }
        }
        updateUsersPopup(usersList);
    });

    socket.on('usersList', function(list){
        usersList = list.list;
        USERNAME = list.yourName;

        updateUsersPopup(usersList);
    });

    socket.on("playstateChange", function(msg){
        var notification = "<img style='height:1.5em;' src='"+playerClassList[msg.userSpec].icon.src+"'>"+msg.userName;
        if(msg.isPlaying)
        {
            notification += " playing from ";
            startReplay();
        }
        else
        {
            notification += " paused at ";
            stopReplay();
        }
        replayTime = msg.time;
        dhtmlx.message({text:notification+timeToString(replayTime)+"."});
        actors.forEach(function(a){a.skip(replayTime);});
        draw.sim.skip(replayTime);//skips the visual effects
        draw.draw(replayTime);
    });

    var usersListDropdown = document.createElement('div');
    usersListDropdown.id = 'usersListDropdown';
    usersListDropdown.className = 'dropdown';
    var usersListButton = document.createElement('button');
    usersListButton.id = 'usersListButton';
    usersListButton.className = 'btn btn-primary dropdown-toggle';
    usersListButton.type = 'button';
    usersListButton.setAttribute('data-toggle','dropdown');
    usersListButton.innerHTML = "<span class='glyphicon glyphicon-user'></span> Users";
    var usersList = document.createElement("div");
    usersList.id = 'usersList';
    usersList.className = 'dropdown-menu';
    usersListDropdown.appendChild(usersListButton);
    usersListDropdown.appendChild(usersList);
    document.getElementById("header").appendChild(usersListDropdown);

    document.getElementById("optionsMenu").innerHTML += "Hold shift to broadcast to room.";
};

var updateUsersPopup = function(usersList)
{
    usersList = usersList.sort(function(a,b){
        if(a < b)
            return -1;
        else if(b > a)
            return 1;
        else
            return 0;
    });
    document.getElementById("usersListButton").innerHTML = "<span class='glyphicon glyphicon-user'></span> "+usersList.length+" User"+(usersList.length>1?"s":"");

    var listDiv = document.getElementById("usersList");
    if(listDiv === null)
        return;
    listDiv.innerHTML = "";
    for(var u of usersList)
    {
        listDiv.innerHTML += "<div style='"+(u.userName===USERNAME?"background-color:white;":"")+
            "border-style:solid;border-color:"+playerClassList[u.userSpec].color+";'"+
            "><img style='height:1.5em;'src='"+playerClassList[u.userSpec].icon.src+"'/> "+u.userName+"</div>";
    }
};