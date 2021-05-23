var startTime; //when the encounter begins
var encounterInfo = null; //name, difficulty, raid size
var draw; //object responsible for controlling the canvas
var timer = null; //the timer that will drive the replay
var timeStep = 15;//how often to step the simulation
var replayTime = 0;//what time in the sim are we
var frameStartTime = 0;
var spells = []; 
var actors = [];
var iconCache = null;


var options = {};
options.simActorSize = 30;
options.movementStyle = 1;
options.replaySpeed = 1;
options.dpsTargets = false;
options.healerRange = false;
options.cameraStyle = 0;
var missing = new Image();
missing.src = "/icons/spell/missing.jpg";


var ResourceNames = {};
ResourceNames[0] = "Mana";
ResourceNames[1] = "Rage";
ResourceNames[2] = "Focus";
ResourceNames[3] = "Energy";
ResourceNames[4] = "Combo Points";
ResourceNames[5] = "Runes";
ResourceNames[6] = "Runic Power";
ResourceNames[7] = "Soul Shards";
ResourceNames[8] = "Lunar Power";
ResourceNames[9] = "Holy Power";
ResourceNames[10] = "Alternate Power";
ResourceNames[11] = "Maelstrom";
ResourceNames[12] = "Chi";
ResourceNames[13] = "Insanity";
ResourceNames[14] = "Obsolete1";
ResourceNames[15] = "Obsolete2";
ResourceNames[16] = "Arcane Power";
ResourceNames[17] = "Fury";
ResourceNames[18] = "Pain";

//called on pageload to setup stuff
function initReplay()
{
    if(typeof SERVERERROR !== 'undefined')
    {
        return document.getElementById("errorOutput").innerHTML = SERVERERROR;  
    }
    if(typeof initSharedRoom !== 'undefined')
    {
        initSharedRoom();
    }

    //most strings from the logs are enclosed in quotes, remove them
    String.prototype.removeExtraQuotes = function()
    {
        var end = this.length-1;
        return this.substr((this[0]==='"'?1:0), (this[end]==='"'?end-1:end+1));
    };
    
    Array.prototype.binarySearch = function(searchTarget, searchProp)
    {
        searchProp = searchProp || "time";
        if(this.length === 0)
            return null;
        
        var stepSize = Math.floor((this.length-1)/4) || 1;
        var searchI = Math.floor((this.length-1)/2);
        
        if(this[0][searchProp] >= searchTarget)
        {
            return 0;
        }
        else if(this[this.length-1][searchProp] <= searchTarget)
        {
            return this.length-1;
        }
        
        for(var emergency = 0; emergency < 200; emergency++)
        {
            if((this[searchI][searchProp] < searchTarget && this[searchI+1][searchProp] > searchTarget) ||
                    this[searchI][searchProp] === searchTarget )
                    
            {
                return searchI;
            }
            else if(this[searchI][searchProp] > searchTarget)
            {
                searchI -= stepSize;
                stepSize = Math.floor(stepSize/2) || 1;
            }
            else if(this[searchI][searchProp] < searchTarget)
            {
                searchI += stepSize;
                stepSize = Math.floor(stepSize/2) || 1;
            }
            else
            {
                console.log("Error: Array.binarySearch, somehow missed the search target");
                return null;
            }
        }
        console.log("Error: Array.binarySearch exceeded emergency limit");
        return null;
    };
    
    //if the browser window size changes, resize the canvases
    window.onresize = function()
    {
        draw.init();
        document.getElementById("fightDescription").style['max-height'] =
            document.getElementById("Sims").getBoundingClientRect().height-40 + "px";
    };
    
    document.getElementById('TimelineCanvas').onmousemove = function(event)
    {
        draw.timeline.updateMousePosition(event.offsetX, event.offsetY);
        draw.timeline.draw();
    };
    document.getElementById('TimelineCanvas').onmouseleave = function()
    {
        draw.timeline.updateMousePosition(null, null);
        draw.timeline.draw();
    };
    
    document.getElementById('TimelineCanvas').onclick = function(event)
    {
        if(encounterInfo === null)
            return;
        if(event.offsetX < 17)
        {
            if(timer === null)
                startReplay();
            else
                stopReplay();
        }
        else if(event.offsetX > 114)//TODO: fix magic numbers
        {
            replayTime = Math.floor((event.offsetX-114) / (draw.timeline.canvas.width-114) * encounterInfo.fightLength) || 0;
            actors.forEach(function(a){a.skip(replayTime);});
            draw.sim.skip(replayTime);//skips the visual effects
            draw.draw(replayTime);
        }

        if(event.shiftKey && typeof socket !== 'undefined')
        {
            socket.emit("playstateChange", {isPlaying:(timer!==null), time:replayTime});
        }
    };
    
    document.getElementById("iconSizeSelector").addEventListener('change',function()
    {
        var s = document.getElementById("iconSizeSelector");
        options.simActorSize = parseFloat(s.options[s.selectedIndex].value);
        if(timer === null)
            draw.draw(replayTime);
    });
    document.getElementById("movementStyleSelector").onchange = function()
    {
        var s = document.getElementById("movementStyleSelector");
        options.movementStyle = parseInt(s.options[s.selectedIndex].value);
        if(timer === null)
            draw.sim.draw(replayTime);
    };
    document.getElementById("replaySpeedSelector").onchange = function()
    {
        var s = document.getElementById("replaySpeedSelector");
        options.replaySpeed = parseFloat(s.options[s.selectedIndex].value);
        draw.timeline.draw();
    };
    document.getElementById("dpsTargets").onchange = function()
    {
        options.dpsTargets = this.checked;
        draw.sim.draw(replayTime);
    };
    document.getElementById("healerRange").onchange = function()
    {
        options.healerRange = this.checked;
        draw.sim.draw(replayTime);
    };
    document.getElementById("dynamicCamera").onchange = function()
    {
        if(this.checked)
        {
            options.cameraStyle = 1;
            simPadding = 1.2;
            draw.sim.scale = draw.sim.fightOffsetX = draw.sim.fightOffsetY = null;
        }
        else
        {
            options.cameraStyle = 0;
            simPadding = 1.1;
        }
        draw.sim.init();
        draw.sim.draw(replayTime);
    };

    document.onkeydown = function(event)
    {
        if(event.ctrlKey)
        {
            var mag = event.shiftKey?10:1;
            if(event.keyCode === 17)
                return;
            if(event.keyCode === 38)//up
            {
                draw.sim.background.mapHeightOffset -= mag;
            }
            else if(event.keyCode === 40)//down
            {
                draw.sim.background.mapHeightOffset += mag;
            }
            else if(event.keyCode === 37)//left
            {
                draw.sim.background.mapWidthOffset -= mag;
            }
            else if(event.keyCode === 39)//right
            {
                draw.sim.background.mapWidthOffset += mag;
            }
            else if(event.keyCode === 90)//z
            {
                mag = event.shiftKey?1:0.001;
                draw.sim.background.mapCoordToPx -= mag;
            }
            else if(event.keyCode === 88)//x
            {
                mag = event.shiftKey?1:0.001;
                draw.sim.background.mapCoordToPx += mag;
            }
            draw.sim.DEBUGDRAW();
            return;
        }

        if(encounterInfo === null)
            return;
        var wasReplayTimeChanged = false;
        if(event.keyCode === 32)//spacebar
        {
            wasReplayTimeChanged = true;
            if(timer === null)
                startReplay();
            else
                stopReplay();
        }
        else if(event.keyCode === 38)//up arrow - increase replay speed
        {
            var s = document.getElementById("replaySpeedSelector");
            if(s.selectedIndex+1 < s.options.length)
            {
                s.selectedIndex++;
                options.replaySpeed = parseFloat(s.options[s.selectedIndex].value);
            }
        }
        else if(event.keyCode === 40)//down arrow - decrease replay speed
        {
            var s = document.getElementById("replaySpeedSelector");
            if(s.selectedIndex-1 >= 0)
            {
                s.selectedIndex--;
                options.replaySpeed = parseFloat(s.options[s.selectedIndex].value);
            }
        }
        else if(event.keyCode === 37)//left arrow - small step baack
        {
            wasReplayTimeChanged = true;
            replayTime -= 50;
            if(replayTime < 0)
                replayTime = 0;
            actors.forEach(function(a){a.skip(replayTime);});
            draw.sim.skip(replayTime);//skips the visual effects
            draw.draw(replayTime);
        }
        else if(event.keyCode === 39)//right arrow - small step forward
        {
            wasReplayTimeChanged = true;
            replayTime += 50;
            replayStep(true);
        }
        else if(event.keyCode >=49 && event.keyCode <= 57)//1-9 skip by percent
        {
            wasReplayTimeChanged = true;
            if(encounterInfo.fightLength > 0)
            {
                replayTime = encounterInfo.fightLength*((event.keyCode-48)/10);
                actors.forEach(function(a){a.skip(replayTime);});
                draw.sim.skip(replayTime);//skips the visual effects
                draw.draw(replayTime);
            }
        }
        else if(event.keyCode === 88)//x - enlarge player icons
        {
            var s = document.getElementById("iconSizeSelector");
            if(s.selectedIndex-1 >= 0)
            {
                s.selectedIndex--;
                options.simActorSize = parseFloat(s.options[s.selectedIndex].value);
                draw.sim.initClassCache();
                draw.draw(replayTime);
            }
        }
        else if(event.keyCode === 90)//z - shrink player icons
        {
            var s = document.getElementById("iconSizeSelector");
            if(s.selectedIndex+1 < s.options.length)
            {
                s.selectedIndex++;
                options.simActorSize = parseFloat(s.options[s.selectedIndex].value);
                draw.sim.initClassCache();
                draw.draw(replayTime);
            }
        }
        else if(event.keyCode === 82 || event.keyCode === 68 || event.keyCode === 72)//r - set sidebar to raid frames//r=82 d=68 h=72
        {
            var s = document.getElementById("sidebarContentSelector");
            for(var oi = 0; oi < s.options.length; oi++)
            {
                if((event.keyCode === 82 && s.options[oi].value === 'raidFrames') ||
                     (event.keyCode === 68 && s.options[oi].value === 'addDps') ||
                     (event.keyCode === 72 && s.options[oi].value === 'hidden'))
                {
                    s.options[oi].selected = 'selected';
                    draw.sidebar.changeContent();
                    break;
                }
            }
        }
        else if(event.keyCode === 69)//e - toggle healer range display
        {
            var t = document.getElementById("healerRange");
            t.checked = !t.checked;
            options.healerRange = t.checked;
            draw.sim.draw(replayTime);
        }
        else if(event.keyCode === 84)//t - toggle DPS target display
        {
            var t = document.getElementById("dpsTargets");
            t.checked = !t.checked;
            options.dpsTargets = t.checked;
            draw.sim.draw(replayTime);
        }
        else if(event.keyCode === 67)//c - toggle dynamic camera
        {
            var t = document.getElementById("dynamicCamera");
            t.checked = !t.checked;
            if(t.checked)
            {
                options.cameraStyle = 1;
                simPadding = 1.2;
            }
            else
            {
                options.cameraStyle = 0;
                simPadding = 1.1;
            }
            draw.sim.init();
            draw.sim.draw(replayTime);
        }
        if(event.shiftKey && typeof socket !== 'undefined' && wasReplayTimeChanged)
        {
            socket.emit("playstateChange", {isPlaying:(timer!==null), time:replayTime});
        }
    };
    //init canvas controller and clear the canvas
    draw = new Graphics();

    document.body.onmousemove = function(e)
    {
        draw.tooltip.updateMousePosition(e);
        draw.tooltip.update();
    };

    if(typeof SERVERDATA !== 'undefined')
    {
        readDataAndSetup(SERVERDATA, true);
    }


    var stopClickPropagation = function(e){e.stopPropagation();};
    document.getElementById("iconSizeSelector").onclick = stopClickPropagation;
    document.getElementById("movementStyleSelector").onclick = stopClickPropagation;
    document.getElementById("replaySpeedSelector").onclick = stopClickPropagation;
    document.getElementById("sidebarContentSelector").onclick = stopClickPropagation;
    document.getElementById("fightDescription").style['max-height'] = document.getElementById("Sims").getBoundingClientRect().height-40 + "px";
};

function resetReplay()
{
    stopReplay();
    timeStep = 15;
    replayTime = 0;
    frameStartTime = 0;
    actors = [];
    spells = [];
    draw.reset();
    iconCache = new IconCache();
};
function readDataAndSetup(theLog, readAsJson)
{
    //reset everything in case a second fight is loaded
    resetReplay();

    if(readAsJson)
    {
        parseJson(theLog);
    }
    else
    {
        resetParse();
        spells.push(new Spell("Melee", -1));
        spellLookup['-1'] = 0;
        spells.push(new Spell("Raidmark Star", -2));
        spellLookup['-2'] = 1;
        spells.push(new Spell("Raidmark Circle", -3));
        spellLookup['-3'] = 2;
        spells.push(new Spell("Raidmark Diamond", -4));
        spellLookup['-4'] = 3;
        spells.push(new Spell("Raidmark Triangle", -5));
        spellLookup['-5'] = 4;
        spells.push(new Spell("Raidmark Moon", -6));
        spellLookup['-6'] = 5;
        spells.push(new Spell("Raidmark Square", -7));
        spellLookup['-7'] = 6;
        spells.push(new Spell("Raidmark X", -8));
        spellLookup['-8'] = 7;
        spells.push(new Spell("Raidmark Skull", -9));
        spellLookup['-9'] = 8;
        actors.push(new Actor("0000000000000000","Environment"));
        actorLookup["0000000000000000"] = actors.length-1;
        parseLog(theLog.split("\n"));
        
        //clean up the data
        foldUnimportantIntoImportant();
        encounterInfo.removeActors();
        convertGuidToIndex();
    }


    //calculate the map draw values
    draw.init();
    //prepare the actors for the sim to start
    initActors();
    //scan the data and figure out what visual elements will need to be drawn
    encounterInfo.setupVisuals();
    //add the raid frame elements
    draw.sidebar.changeContent();
    draw.sim.initClassCache();
    document.getElementById("fightName").innerHTML = encounterInfo.getFileName();
    document.getElementById("fightNameDropdown").style.visibility = 'visible';
    document.getElementById('optionsDropdown').style.visibility = 'visible';
    document.getElementById('sidebarContentSelector').style.visibility = 'visible';
    document.getElementById("fightDescription").innerHTML = encounterInfo.encounterDescription;
    
    draw.draw(0);
}
//begin the simulation.
function startReplay()
{
    //make sure there's something to start playing
    if(actors === [])
    {
        console.log("startReplay: No log read in yet?");
        return;
    }
    //if the sim has ended at the end, restart at the beginning
    if(replayTime >= encounterInfo.fightLength)
    {
        replayTime = 0;
        actors.forEach(function(a){a.skip(replayTime);});
        draw.sim.skip(replayTime);
    }
        
    timer = setInterval(replayStep, timeStep);
};

//wrapper function for the global scope to call to advance the simulation.
function replayStep(skipAutoIncrement)
{
    if(!skipAutoIncrement)
    {
        if(timer === null)
            return;
        //advance the sim by how much real world time passed since last frame
        replayTime += ((frameStartTime)?Date.now() - frameStartTime:15) * options.replaySpeed;
        frameStartTime = Date.now();
    }
    
    if(replayTime >= encounterInfo.fightLength)
    {
        stopReplay();
        replayTime = encounterInfo.fightLength;
    }
    actors.forEach(function(a){a.step(replayTime);});
    draw.draw(replayTime);
};

function replaySkip(newTime)
{

};

//stops the clock on the simulation.
function stopReplay()
{
    clearInterval(timer); 
    timer = null;
    frameStartTime = 0;
};

//formats a long number into readable form, 12345 -> 12k
function numToShortStr(num)
{
    if(num === undefined)
    {
        console.log("numToShortStr Error: No value passed in.");
        return "";
    }
    var suffix = "";
    while(Math.floor(num).toString().length > 3)
    {
        num /= 1000;

        if(suffix === "")
            suffix = "k";//kilo
        else if(suffix === "k")
            suffix = "m";//millions
        else if(suffix === "m")
            suffix = "b";//billions
        else if(suffix === "b")
            suffix = "t";//trillion
    }

    if(num.toString().indexOf('.') === 2)
    {
        return num.toString().substr(0,2) + suffix;
    }
    return num.toString().substr(0,3) + suffix; 
};

//converts a number(miliseconds) to "1:23.456"
function timeToString(time, howManyMillis)
{
    var output = "";
    if(!(howManyMillis === 0 || howManyMillis === 1 ||
            howManyMillis === 2 || howManyMillis === 3))
        howManyMillis = 0;
        
    if(time === undefined || time === null)
    {
        return "0:00";
    }
    time /= 1000;
    if(howManyMillis > 0)
    {
        var split = time.toString().split('.');
        if(split[1])
        {
            output = "."+split[1].substr(0,howManyMillis);
        }
    }
    var minutes = Math.floor(time/60).toString();
    var seconds = Math.floor(time%60).toString();
    if(seconds < 10)
        seconds = "0"+seconds;
    output = minutes + ":" + seconds + output;
    return output;
};

//class, one of the spells used in the encounter.
//name(string) name of the spell
//spellId(String), id of the spell, also used to find the icon

var Spell = function(name, spellId)
{
    this.name = name;
    this.id = parseInt(spellId); 
    this.icon = null;
    
    this.getIcon = function()
    {
        if(this.icon === null)
        {
            this.icon = new Image();
            this.icon.onerror = function(event){event.target.src = "/icons/spell/missing.jpg";};
            if(this.id >= -1)
                this.icon.src = '/icons/spell/'+this.id+'.jpg';
            else//must be one of the raidmarks
                this.icon.src = '/icons/marks/'+this.id+'.png';

            return missing;
        }
        else if(this.icon.complete === false || this.icon.width === 0)
        {
            return missing;
        }
        else
            return this.icon;
    };
};
var IconCache = function()
{
    this.sizeCache = {};
    //this.imageLocation = {};
    this.imgPerLine = 20;

    this.drawIcon = function(spellIndex, size, targetCtx, targetX, targetY)
    {
        if(!Number.isInteger(size))
            console.log("Warning, non-int size passed into iconCache: "+size);
        if(this.sizeCache[size] === undefined)
        {
            this.sizeCache[size] = new CanvasCache(size, this.imgPerLine);
        }
        this.sizeCache[size].drawIcon(spellIndex, targetCtx, targetX, targetY);
    };
};

var CanvasCache = function(size, imgPerLine)
{
    this.size = size;
    this.imgPerLine = imgPerLine;
    this.imageLoc = {};

    var firstCanvas =  document.createElement("canvas");
    firstCanvas.height = this.size;
    firstCanvas.width = this.size*this.imgPerLine;
    this.cacheLines = [];
    this.cacheLines.push({canvas: firstCanvas,
                            ctx:firstCanvas.getContext('2d'),
                            occupancy:1});//first cache line will have the missing icon
    this.cacheLines[0].ctx.drawImage(missing, 0,0, this.size, this.size);
    
    this.drawIcon = function(spellIndex, targetCtx, targetX, targetY)
    {
        var icon = spells[spellIndex].getIcon();
        if(icon === missing)
        {
            targetCtx.drawImage(this.cacheLines[0].canvas, 0, 0, this.size, this.size, targetX, targetY, this.size, this.size);
        }
        else if(this.imageLoc[spellIndex])
        {
            targetCtx.drawImage(this.cacheLines[this.imageLoc[spellIndex].whichLine].canvas, this.imageLoc[spellIndex].pos*this.size, 0, this.size, this.size,
                                    targetX, targetY, this.size, this.size);
        }
        else
        {
            var topCache = this.cacheLines[this.cacheLines.length-1];
            if(topCache.occupancy === this.imgPerLine)
            {
                var newCanvas = document.createElement("canvas");
                newCanvas.width = this.cacheLines[0].canvas.width;
                newCanvas.height = this.cacheLines[0].canvas.height;
                topCache = {canvas:newCanvas, ctx:newCanvas.getContext('2d'), occupancy:0};
                this.cacheLines.push(topCache);
            }
            topCache.ctx.drawImage(icon, topCache.occupancy*this.size, 0, this.size, this.size);
            this.imageLoc[spellIndex] = {whichLine:this.cacheLines.length-1, pos:topCache.occupancy};
            topCache.occupancy++;

            targetCtx.drawImage(topCache.canvas, this.imageLoc[spellIndex].pos*this.size, 0, this.size, this.size,
                targetX, targetY, this.size, this.size);
        }

    }
};

var highlightActor = function(actor)
{
    if(actor === undefined)
        actor = null;
    draw.sidebar.highlightActor(highlightedActor, actor);
    highlightedActor = actor;
    draw.draw(replayTime);
};

var parseJson = function(json)
{
    //'?' seperates the major parts, fight info, actors, and spells
    var version = null;
    var questions = json.split("?");
    if(questions.length === 3)
    {
        version = 0;
    }
    else if(questions[0].startsWith('v'))
    {
        version = parseInt(questions[0].substr(1));
    }
    if(Number.isNaN(version) || version === null)
    {
        console.log("parseJson: unable to determine file version");
        return;
    }

    if(version === 0)
    {
        parseJsonEncounter0(questions[0]);
        var jsonActors = questions[1].split("{");
        for(var i = 1; i < jsonActors.length; i++)//0 is a empty string
        {
            parseJsonActor0(jsonActors[i]);
        }
        var jsonSpells = questions[2].split("|");
        for(var jSpell of jsonSpells)
        {
            var split = jSpell.split("@");
            spells.push(new Spell(split[0], split[1]));
        }
    }
    else if(version === 1)
    {
        parseJsonEncounter0(questions[1]);
        var jsonActors = questions[2].split("{");
        for(var i = 1; i < jsonActors.length; i++)//0 is a empty string
        {
            parseJsonActor1(jsonActors[i]);
        }
        var jsonSpells = questions[3].split("|");
        for(var jSpell of jsonSpells)
        {
            var split = jSpell.split("@");
            spells.push(new Spell(split[0], split[1]));
        }
    }
    else
    {
        console.log("parseJson: Unexpected file version number: "+ version);
        return;
    }
};

var setGroupAjax = function(fightId)
{
    var button = document.getElementById("setGroupViewButton");
    button.value="Updating...";
    button.enabled = false;
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState === 4)
        {
            button.value = xmlhttp.response;
            if(xmlhttp.status === 200)
                button.enabled = true;
        }
    };
    xmlhttp.open("POST", "/setGroup/"+fightId);
    xmlhttp.send();
};

