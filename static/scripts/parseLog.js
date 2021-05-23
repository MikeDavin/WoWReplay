var year = new Date().getFullYear(); //a string of the current year
var spellLookup = {};
var actorLookup = {};
var unimportantActors = {};
var parseRaidmarkTargets = {};

//most strings from the logs are enclosed in quotes, remove them
String.prototype.removeExtraQuotes = function()
{
    var end = this.length-1;
    return this.substr((this[0]==='"'?1:0), (this[end]==='"'?end-1:end+1));
};

String.prototype.splitPerserveQuotedCommas = function()
{
    var output = [];
    var inQuotes = false;
    var token = "";
    for(var i = 0; i < this.length; i++)
    {
        var c = this[i];
        if(c === '"')
            inQuotes = !inQuotes;
        else if(c === ',')
        {
            if(!inQuotes){
                output.push(token);
                token = "";
            }
            continue;
        }
        token += c;
    }
    if(token !== "")
        output.push(token);
    return output;
};

//this gets called upon file selection, sets up the callback function
//that will fire upon the file being read in.
//evt - passed in by the VM that holds the file reference
function handleFileSelect(files)
{
    if(files.length === 0)
        return;
    if(!files[0].type.match('text.*'))
    {
        alert("Please select a text file, type of file selected: "+file.type);
        return;
    }
    
    var reader = new FileReader();
    reader.onload = function(e)
    {
        readDataAndSetup(e.target.result, false);
    };
    reader.readAsText(files[0]);
}



function resetParse()
{
    unimportantActors = {};
    spellLookup = {};
    actorLookup = {};
    parseRaidmarkTargets = {};
    parseRaidmarkTargets['-2'] = null;
    parseRaidmarkTargets['-3'] = null;
    parseRaidmarkTargets['-4'] = null;
    parseRaidmarkTargets['-5'] = null;
    parseRaidmarkTargets['-6'] = null;
    parseRaidmarkTargets['-7'] = null;
    parseRaidmarkTargets['-8'] = null;
    parseRaidmarkTargets['-9'] = null;
}

var uploadFightToServer = function(fightString, statusDiv, includeName)
{
    includeName = includeName || false;
    statusDiv.innerHTML = "Reading data";
    resetParse();
    actors = [];
    spells = [];
    spells.push(new Spell("Melee", -1, 0));
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
    parseLog(fightString.split("\n"));

    //clean up the data
    statusDiv.innerHTML = "Cleaning data";
    foldUnimportantIntoImportant();
    encounterInfo.removeActors();
    convertGuidToIndex();
    var fightData = saveAsJson();
    var json = '{"encounterName":"'+encounterInfo.name+'"';
    json += ',"difficulty":'+encounterInfo.difficulty;
    json += ',"raidSize":'+encounterInfo.raidSize;
    var p = createDate(encounterInfo.pullTime);
    json += ',"pullTime":"'+p.getFullYear()+"-"+(p.getMonth()+1)+"-"+p.getDate()+" "+
        p.getHours()+":"+p.getMinutes()+":"+p.getSeconds()+'"';
    json += ',"won":'+(encounterInfo.encounterWon?1:0);
    json += ',"duration":'+encounterInfo.fightLength;
    json += ',"encounterID":'+encounterInfo.encounterID;
    json += ',"data":"'+fightData+'"}';
    
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        statusDiv.innerHTML = (includeName?encounterInfo.getFileName()+",  ":"")+"Uploading "+(xmlhttp.readyState*25)+"%";
        if(xmlhttp.readyState === 4)
        {
            statusDiv.innerHTML = (includeName?encounterInfo.getFileName()+",  ":"")+xmlhttp.response;
        }

    };
    xmlhttp.open("POST", "/uploadFight", true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send(encodeURI(json));    
};

//extract data from the combat log text.
function parseLog(theFile)
{

    //error check the array of file lines
    if(theFile === null || theFile.length === 0) 
    {
        alert("File Error: Empty file");
        return;
    }
    var combatantInfoCount = 0;
    var firstLine = theFile[0].split("  ");
    //var firstLineData = firstLine[1].split(",");
    if(!firstLine[1].startsWith("ENCOUNTER_START"))//make sure at least the first line makes sense
    {
        alert("parseLog: File does not start with a 'ENCOUNTER_START' event.");
        return;
    }
    
    //init the fight name, difficulty, and size
    startTime = createDate(firstLine[0]);
    initEncounter(firstLine);
    
    for(var fileIndex = 1; fileIndex < theFile.length-1; fileIndex++)
    {
        var line = theFile[fileIndex].split("  ");
        var timeoffset = strToMiliOffset(line[0]);
        var event = line[1].splitPerserveQuotedCommas();
        var stateName = null;
        var actor = null;
        
        if(event[0] === "RANGE_DAMAGE" || event[0] === "SPELL_DAMAGE" ||
                event[0] === "SPELL_HEAL" || event[0] === "SPELL_PERIODIC_DAMAGE" || 
                event[0] === "SPELL_PERIODIC_HEAL")
        {
            if(!(event.length === 34 || event.length === 29))
                console.log("Warning: damage/heal unexpected event length: "+ event.length);
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var stateGuid = event[12], stateController = event[13];
            var curHP = event[14], maxHP = event[15], resType = event[18], curRes = event[19], maxRes = event[20], x = event[22], y = event[23];
            var spellId = event[9], spellName = event[10], ammount = event[25], isTarget = isTargeted(event[7]);

            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            var actor = null;
        
            if(event[0] === "RANGE_DAMAGE" || event[0] === "SPELL_DAMAGE" || event[0] === "SPELL_PERIODIC_DAMAGE")
                srcActor.damageDone.add(spellId, spellName, targGuid, ammount, isTarget, timeoffset);
            else if(event[0] === "SPELL_HEAL" || event[0] === "SPELL_PERIODIC_HEAL")
                srcActor.healingDone.add(spellId, spellName, targGuid, ammount, isTarget, timeoffset);
            
            if(stateGuid === srcGuid)
                actor = srcActor;
            else if(stateGuid === targGuid)
                actor = targActor;
            else    
                actor = getParseActor(stateGuid, "", null);

            actor.states.add(curHP, maxHP, resType, curRes, maxRes, x, y ,timeoffset);
            setUnimpController(stateGuid, stateController);
        }
        //TODO decide how to record split damage, don't want to credit the spliter
        //with extra dps, still need to record the hit the splitee is taking?
        //current setup just records outgoing events, not incoming
        else if(event[0] === "SPELL_DRAIN" || event[0] === "SPELL_ENERGIZE" 
                 || event[0] === "SPELL_PERIODIC_ENERGIZE" || event[0] === "DAMAGE_SPLIT")
        {
            if(!(event.length === 28 || event.length === 29 || event.length === 34))
                console.log("Warning: unexpected length on drain/energize/split: "+event.length);

            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var stateGuid = event[12], stateController = event[13];
            var curHP = event[14], maxHP = event[15], resType = event[18], curRes = event[19], maxRes = event[20], x = event[22], y = event[23];
            var actor = null;
            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            if(stateGuid === srcGuid)
                actor = srcActor;
            else if(stateGuid === targGuid)
                actor = targActor;
            else
                actor = getParseActor(stateGuid, "", null);
            actor.states.add(curHP, maxHP, resType, curRes, maxRes, x, y ,timeoffset);
            setUnimpController(stateGuid, stateController);

            if(event[0] === "SPELL_ENERGIZE" || event[0] === "SPELL_PERIODIC_ENERGIZE")
            {
                if(event.length === 34)
                    console.log("Warning, unexpected length on energize/perioic energize, may miss alt power gain: "+ event.length);

                var spellId = event[9], spellName = event[10], resGain = event[25], gainType = event[27], typeCap = event[28];
                if(gainType === "10")
                {
                    getParseActor(targGuid, targName, targFlags).miscEvents.addAltPowerGain(parseInt(resGain), parseInt(typeCap),parseInt(spellId), spellName, timeoffset);
                }
            }
        }
       
        //TODO environmental damage, attribute the damage without a source
        //add a "env" actor to cover this and split?
        else if(event[0] === "SWING_DAMAGE" || event[0] === "ENVIRONMENTAL_DAMAGE")
        {
            if(event.length !== 31 && event.length !== 32)
                console.log("Warning, swing/env damage unexpected event length: "+ event.length);

            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var stateGuid = event[9], stateController = event[10];
            var curHP = event[11], maxHP = event[12], resType = event[15], curRes = event[16], maxRes = event[17], x = event[19], y = event[20];

            var actor = null;
            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            if(stateGuid === srcGuid)
                actor = srcActor;
            else if(stateGuid === targGuid)
                actor = targActor;
            else
                actor = getParseActor(stateGuid, "", null);

            actor.states.add(curHP, maxHP, resType, curRes, maxRes, x, y ,timeoffset);
            setUnimpController(stateGuid, stateController);           
        }
        else if(event[0] === "SWING_DAMAGE_LANDED")    
        {
            if(event.length !== 31)
                console.log("Warning: swing damage landed unexpected length: "+event.length);
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var stateGuid = event[9], stateController = event[10];
            var curHP = event[11], maxHP = event[12], resType = event[15], curRes = event[16], maxRes = event[17], x = event[19], y = event[20];
            var spellId = -1, spellName = "Melee", isTarget = true, ammount = event[22];
            var actor = null;
            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset)
            srcActor.damageDone.add(spellId, spellName, targGuid, ammount, isTarget, timeoffset);

            if(stateGuid === srcGuid)
                actor = srcActor;
            else if(stateGuid === targGuid)
                actor = targActor;
            else
                actor = getParseActor(stateGuid, "", null);
            
            actor.states.add(curHP, maxHP, resType, curRes, maxRes, x, y ,timeoffset);
            setUnimpController(stateGuid, stateController);        
        }

        
        else if(event[0] === "SPELL_CAST_START")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var spellId = event[9], spellName = event[10];
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset).casts.start(spellId, spellName, timeoffset);
        }
        
        else if(event[0] === "SPELL_CAST_SUCCESS")
        {
            //event[16] == attack power event[17] == spellpower?
            if(!(event.length === 24 || event.length === 25))
                console.log("Warning: spellCastSuccess unexpected length: "+event.length);
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var spellId = event[9], spellName = event[10], didCastFinish = true;
            var stateGuid = event[12], stateController = event[13];
            var curHP = event[14], maxHP = event[15], resType = event[18], curRes = event[19], maxRes = event[20]
            var x, y;
            if(event.length === 24)
                 x = event[21], y = event[22];
            else if(event.length === 25)
                x = event[22], y = event[23];

            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            var actor = null;
            srcActor.casts.finish(spellId, spellName, didCastFinish, targGuid, timeoffset);

            if(stateGuid === srcGuid)
                actor = srcActor;
            else if(stateGuid === targGuid)
                actor = targActor;
            else
                actor = getParseActor(stateGuid, "", null);

            actor.states.add(curHP, maxHP, resType, curRes, maxRes, x, y ,timeoffset);
            setUnimpController(stateGuid, stateController); 
        }
        
        else if(event[0] === "SPELL_CAST_FAILED")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var spellId = event[9], spellName = event[10], didCastFinish = false;
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset).casts.finish(spellId, spellName, didCastFinish, targGuid, timeoffset);
        }
        
        //treating absorbs as heals done by the player who applied 
        else if(event[0] === "SPELL_ABSORBED")
        {
            var srcGuid, srcName, srcFlags, srcRaidFlags, spellId, spellName, targGuid, ammount, isTarget = false;
            if(event.length === 20)
                srcGuid = event[12], srcName = event[13], srcFlags = event[14], srcRaidFlags = event[15], spellId = event[16], spellName = event[17], targGuid = event[5], ammount = event[19];
            else if(event.length === 17)
                srcGuid = event[9], srcName = event[10], srcFlags = event[11], srcRaidFlags = event[12], spellId = event[13], spellName = event[14], targGuid = event[5], ammount = event[16];
            else
            {
                console.log("parse.spell_absorb: unexpected event length: "+event.length);
                continue;
            }
            getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset).healingDone.add(spellId, spellName, targGuid, ammount, isTarget, timeoffset);
        }
        
        else if(event[0] === "UNIT_DIED" || event[0] === "SPELL_INSTAKILL")
        {
            var srcGuid = event[5], srcName = event[6], srcFlags = event[7], srcRaidFlags = event[8];
            getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset).states.addDeath(timeoffset);
        }
        
        else if(event[0] === "SPELL_AURA_APPLIED")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var auraId = event[9], auraName = event[10], isBuff = event[12], magnitude = event[13];
            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset).auras.apply(auraId, auraName, srcGuid, isBuff, timeoffset, magnitude);
        }
        
        else if(event[0] === "SPELL_AURA_REMOVED")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var auraId = event[9], auraName = event[10], isBuff = event[12];
            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset).auras.end(auraId, auraName, srcGuid, isBuff, timeoffset);
        }
        
        else if(event[0] === "SPELL_AURA_BROKEN")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var auraId = event[9], auraName = event[10], isBuff = event[12];
            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            srcGuid = null;
            getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset).auras.end(auraId, auraName, srcGuid, isBuff, timeoffset);       
        }
        
        else if(event[0] === "SPELL_AURA_BROKEN_SPELL")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var auraId = event[9], auraName = event[10], isBuff = event[15];
            var srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            srcGuid = null;
            getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset).auras.end(auraId, auraName, srcGuid, isBuff, timeoffset);
        }
        
        else if(event[0] === "SPELL_DISPEL")
        {//TODO: still need to track/credit the dispeller
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var auraId = event[12], auraName = event[13], isBuff = event[15];
            var actor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            var target = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            //target.auras.end(auraId, auraName, null/*missing from event*/, isBuff, timeoffset);
            actor.miscEvents.addDispell(targGuid, auraId, auraName, timeoffset);
        }
        
        else if(event[0] === "SPELL_AURA_REFRESH")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var auraId = event[9], auraName = event[10], isBuff = event[12], magnitude = event[13];
            srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset).auras.apply(auraId, auraName, srcGuid, isBuff, timeoffset, magnitude);
        }
        
        else if(event[0] === "SPELL_AURA_APPLIED_DOSE" || event[0] === "SPELL_AURA_REMOVED_DOSE")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var auraId = event[9], auraName = event[10], isBuff = event[12], stack = event[13];
            srcActor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset).auras.changeStack(auraId, auraName, srcGuid, isBuff, stack, timeoffset);
        }
        
        else if(event[0] === "SPELL_SUMMON")
        {
            var parentGuid = event[1], parentName = event[2], parentFlags = event[3], parentRaidFlags = event[4];
            var childGuid = event[5], childName = event[6], childFlags = event[7], childRaidFlags = event[8];
            var parent = getParseActor(parentGuid, parentName, parentFlags, parentRaidFlags, timeoffset);
            var child = getParseActor(childGuid, childName, childFlags, childRaidFlags, timeoffset);
            setUnimpController(childGuid, parentGuid); 
        }
        
        else if(event[0] === "SPELL_MISSED" || event[0] === "SWING_MISSED"
            || event[0] === "SPELL_PERIODIC_MISSED" || event[0] === "RANGE_MISSED")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            if(event[0] === "SWING_MISSED")
                var spellId = -1, spellName = "Melee";
            else
                var spellId = event[9], spellName = event[10];
                
            var actor = getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset);
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            actor.damageDone.add(spellId, spellName, targGuid, 0, false, timeoffset);
        }

        else if(event[0] === "SPELL_INTERRUPT")
        {
            var srcGuid = event[1], srcName = event[2], srcFlags = event[3], srcRaidFlags = event[4];
            var targGuid = event[5], targName = event[6], targFlags = event[7], targRaidFlags = event[8];
            var interruptedId = event[12], interruptedName = event[13];
            var targActor = getParseActor(targGuid, targName, targFlags, targRaidFlags, timeoffset);
            getParseActor(srcGuid, srcName, srcFlags, srcRaidFlags, timeoffset).miscEvents.addInterrupt(targGuid, interruptedId, interruptedName, timeoffset);
        }

        else if(event[0] === "UNIT_DESTROYED" ||
            event[0] === "SPELL_CREATE" || event[0] === "SPELL_RESURRECT" ||
		    event[0] === "PARTY_KILL" || event[0] === "SPELL_HEAL_ABSORBED")
        {
            //do nothing
        }
        else if(event[0] === "COMBATANT_INFO")
        {
            combatantInfoCount++;
            var actor = getParseActor(event[1], "", null);
            for(var pcIndex = 0; pcIndex < playerClassList.length; pcIndex++)
            {
                var pc = playerClassList[pcIndex];
                if(pc.specId === parseInt(event[23]))
                {
                    actor.class = pc;
                    break;
                }
            }
        }
        else if(event[0] === "ENCOUNTER_END")
        {
            if(combatantInfoCount === 0)
            {
                alert("Expected to see "+encounterInfo.raidSize+" 'COMBATANT_INFO' messages in the log, only found "+combatantInfoCount+". Discarding fight, make sure the log is post 7.0 with Advanced Combat Logging enabled.");
                actors = [];
                encoutnerInfo = {};
                return;
            }
            encounterInfo.fightLength = timeoffset;
            encounterInfo.encounterWon = (event[5][0]==='1');
            break;
        }
        else if(event[0] === "ENCOUNTER_START")
        {
            console.log("WARNING: second encounter_start message found before end of fight, data may be corrupted.");
        }
        else
        {
            console.log("Unknown event type: " + theFile[fileIndex]);
        }
    }
};

//  11/12 22:29:33.612 
function createDate(s)
{
    var runningCount = 0;
    var result = [];
    for(var i = 0; i < s.length; i++)
    {
        if(s[i] === '/' || s[i]=== ' ' || s[i] === ':' || s[i] === '.')
        {
            result.push(runningCount);
            runningCount = 0;
        }
        else
        {
            runningCount *= 10;
            runningCount += (s[i]-'0');
        }
    }
    //the month is 
    return new Date(year, result[0]-1, result[1], result[2], result[3], result[4], runningCount);
};

//takes in the string of the timestamp from a entry, returns the miliseconds
//that have passed since the encounter began.
//timestamp - string of the date/time that starts each line of the log
function strToMiliOffset(timestamp)
{   
    return createDate(timestamp) - startTime;
};

//checks the bit flags associated with a actor to determine if its a player/enemy
//that we care about, or a pet/totem/guardian that we do not.
//flags - string of the flags associated with a actor
function doesActorMatter(flags, name, guid)
{
    if(flags === null)
        return true;
    var f = parseInt(flags);
    if(f & 0x400)//actor is a player character
    {
        return true;
    }
    else if((f & 0x800) && (f&0x40))//actor is a NPC and hostile
    {
        return true;
    }
    //some mobs appear as neutral guardians, check if fight data cares
    for(var mi = 0; mi < encounterInfo.mobs.length; mi++)
    {
        var mob = encounterInfo.mobs[mi];
        var actorGuidParts = guid.split('-');
        var actorID = parseInt(actorGuidParts[actorGuidParts.length-2]);
        if(name && mob.mobID === actorID)
            return true;
    }
        
    return false;
};


//checks the flags and returns true if the targeted flag is true
function isTargeted(flags)
{
    return (parseInt(flags) & 0x10000) !== 0;
}

//Object.getOwnPropertyNames(spells) to list all properties
var getSpellIndexFromId = function(spellId, spellName)
{
    //spellId = parseInt(spellId);
    var spellIndex = spellLookup[spellId];
    if(spellIndex === undefined)
    {
        spells.push(new Spell(spellName, spellId));
        spellLookup[spellId] = spells.length-1;
        return spells.length-1;
    }
    return spellIndex;
};

//the major parts of the file are seperated by '?'
//the first entry is 'vx' where x is the version
//they are the basic fight info, the array of actors, and the array of spells.
//fight info is seperated by '@'
//
//actors begin with a '{', parts of the actor are seperated by '['. the parts are their name/guid, 
// state changes, casts, actions, and aruas.
//Actors have their name and guid seperated by '@'
//state changes are seperated by '|', individual elements of a change are seperated by '@', state indexes and values are seperated by ':'
//each cast is seperated by a '|', parts of a cast are seperated by '@'
//same for actions
//each aura begins with a '<', followed by its spellId, source, and type seperated by '@'
//the shared aura data and its state changes are seperated by '|'
var saveAsJson = function()
{
    if(actors === [])
        return;
    
    var json = "v1?";
    json += encounterInfo.getJson()+"?";
    for(var actor of actors)
    {
        json += actor.getJson();
    }
    json += "?";
    for(var spell of spells)
    {
        json += spell.name +"@";
        json += spell.id +"|";
    }
    json = json.substr(0, json.length-1);
    return json;
};

function convertGuidToIndex()
{
    var gti = {};//GUID to Index
    var envirIndex;
    actors.forEach(function(a,i)
    {
        gti[a.guid] = i;
        if(a.guid === "0000000000000000")
            envirIndex = i;
    });
    actors.forEach(function(a,i)
    {
        a.casts.CA.forEach(function(c)
        {
            if(gti[c.target] === undefined)
                c.target = envirIndex;
            else
                c.target = gti[c.target];
        });
        a.damageDone.AA.forEach(function(act)
        {
            if(gti[act.target] === undefined)
            {
                act.target = envirIndex;
                act.isPrimaryTarget = false;
            }
            else
                act.target = gti[act.target];
        });
        
        a.healingDone.AA.forEach(function(act)
        {
            if(gti[act.target] === undefined)
            {
                act.target = envirIndex;
                act.isPrimaryTarget = false;
            }
            else
                act.target = gti[act.target];
        });

        a.miscEvents.MA.forEach(function(misc){
            if(misc.target !== undefined)
            {
                misc.target = gti[misc.target];
            }
        });
        
        var originalAM = a.auras.AM;
        a.auras = new Auras();

        for(var aura of originalAM)
        {
            aura=aura[1];
            //chance the aura source is not in the array and will not generate
            //a valid index.
            if(gti[aura.source] !== undefined)
            {
                aura.source = gti[aura.source];
                a.auras.AM.set(aura.spellIndex+"@"+aura.source, aura);
            }
            else
            {
                aura.source = envirIndex;
                var keyString = aura.spellIndex+"@"+aura.source;
                if(a.auras.AM.has(keyString))
                {
                    a.auras.AM.get(keyString).foldIn(aura);
                }
                else
                    a.auras.AM.set(keyString, aura);
            }
        }
    });
};

function getParseActor(guid, name, flags, raidFlags, time)
{
    name = name.removeExtraQuotes();
    if(guid === "0000000000000000")
        name = "Environment"
    if(name === 'nil' || name === 'Unknown' || name === 'null' || name === "")
        name = null;
    var raidMark

    var actor = actors[actorLookup[guid]];
    //actor has already been created
    if(actor)
    {
        //check if the actor's name has changed
        if(name !== null && actor.name !== name)
        {
            var nameChange = true;
            //check if the name has changed to something we don't care about
            for(var mobIndex = 0; mobIndex < encounterInfo.mobsToIgnore.length; mobIndex++)
            {
                //the new name is bad, do not change the actor
                if(encounterInfo.mobsToIgnore[mobIndex] === name)
                    nameChange = false;
            }
            //the new name is good, change it
            if(nameChange)
                actor.name = name;
        }
    }
    else if(doesActorMatter(flags, name, guid))
    {
        //create a new actor object, add it to the container, and return 
        actor = new Actor(guid, name);
        actors.push(actor);
        actorLookup[guid] = actors.length-1;
        //check if the name has changed to something we don't care about
        if(encounterInfo)
        {
            for(var mobIndex = 0; mobIndex < encounterInfo.mobsToIgnore.length; mobIndex++)
            {
                //the new name is bad, do not change the actor
                if(encounterInfo.mobsToIgnore[mobIndex] === name)
                    actor.states.add = actor.states.addWithoutBounds;
            }
        }
        return actor;
    }
    else
    {
        //return the unimportantActor object
        actor = unimportantActors[guid];
        //if the containing object hasn't seen this pet yet, add it
        if(!actor)
        {
            actor = new Actor(guid, name);
            actor.ownerGuid = null;
            unimportantActors[guid] = actor;
            actor.states.add = actor.states.addWithoutBounds;
        }

        //check if the actor's name has changed
        if(name !== null && actor.name !== name)
        {
            var nameChange = true;
            //check if the name has changed to something we don't care about
            for(var mobIndex = 0; mobIndex < encounterInfo.mobsToIgnore.length; mobIndex++)
            {
                //the new name is bad, do not change the actor
                if(encounterInfo.mobsToIgnore[mobIndex] === name)
                    nameChange = false;
            }
            //the new name is good, change it
            if(nameChange)
                actor.name = name;
        }
    }
    if(raidFlags)
    {
        if(raidFlags[0] !== '0' || raidFlags[1] !== 'x')
        {
            console.log("getParseActor Warning: invalid raidFlags input: "+raidFlags);
            return actor;
        }
        if(actor.guid === "0000000000000000")
        {
            return actor;
        }

        var flagIndex = null;

        var flagValue = Number.parseInt(raidFlags);
        if(flagValue === 0 || flagValue & 0x80000000)
            return actor;
        else if(flagValue & 0x1)
            flagIndex = -2;
        else if(flagValue & 0x2)
            flagIndex = -3;
        else if(flagValue & 0x4)
            flagIndex = -4;
        else if(flagValue & 0x8)
            flagIndex = -5;
        else if(flagValue & 0x10)
            flagIndex = -6;
        else if(flagValue & 0x20)
            flagIndex = -7;
        else if(flagValue & 0x40)
            flagIndex = -8;
        else if(flagValue & 0x80)
            flagIndex = -9;
        else
            console.log("getParseActor Info: unexpected raid flag: "+raidFlags);


        
        if(flagIndex && parseRaidmarkTargets[flagIndex] !== actor)
        {
            if(time === null || time === undefined)
            {
                console.log("getParseActor error: time not passed in.")
                return actor;
            }
            //if someone else had this mark, remove it from them
            if(parseRaidmarkTargets[flagIndex] !== null)
                parseRaidmarkTargets[flagIndex].auras.end(flagIndex, "", "0000000000000000", "DEBUFF", time);
            //check if this actor had any previous marks
            for(var rmi = -2; rmi >= -9; rmi--)
            {
                if(parseRaidmarkTargets[rmi] === actor)
                {
                    parseRaidmarkTargets[rmi].auras.end(rmi, "", "0000000000000000", "DEBUFF", time);
                }
            }
            actor.auras.apply(flagIndex, "", "0000000000000000", "DEBUFF", time);
            parseRaidmarkTargets[flagIndex] = actor;
        }
    }

    return actor;
};

function setUnimpController(stateGuid, controllerGuid)
{
    //check if any unimp. actors can be updated
    if(unimportantActors[stateGuid])
    {
        if((unimportantActors[stateGuid].ownerGuid === null ||
            unimportantActors[stateGuid].ownerGuid === "0000000000000000") &&
            (controllerGuid !== null || controllerGuid !== "0000000000000000"))
        {
            unimportantActors[stateGuid].ownerGuid = controllerGuid;
        }
    }
};

//function, after the log has been parsed, attribute any damage/healing done by pets
//to the actors that control them.
var foldUnimportantIntoImportant = function()
{
    Object.getOwnPropertyNames(unimportantActors).forEach(function(ug)
    {
        var ua = unimportantActors[ug];
        if(ua.ownerGuid !== null && actors[actorLookup[ua.ownerGuid]] !== undefined)
        {
            var ia = actors[actorLookup[ua.ownerGuid]];
            var unimpDamage = ua.damageDone.AA;
            var impDamage = ia.damageDone.AA;
            var ui = ii = 0;
            while(ui < unimpDamage.length)
            {
                while(ii < impDamage.length && unimpDamage[ui].time > impDamage[ii].time)
                {
                    ii++;
                }
                impDamage.splice(ii, 0, unimpDamage[ui]);
                ui++;
            }
            
            var unimpHealing = ua.healingDone.AA;
            var impHealing = ia.healingDone.AA;
            ui = ii = 0;
            while(ui < unimpHealing.length)
            {
                while(ii < impHealing.length && unimpHealing[ui].time > impHealing[ii].time)
                {
                    ii++;
                }
                impHealing.splice(ii, 0, unimpHealing[ui]);
                ui++;
            }
        }
        else
        {
            console.log("No parent for: "+ unimportantActors[ug].name+"("+unimportantActors[ug].guid+")");
        }
    });//foreach
};