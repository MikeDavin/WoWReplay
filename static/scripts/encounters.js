//object, holds info about the important mobs and auras of a given encounter.
//nameIn(string) name of the encounter
var Encounter = function(esLine)
{
    //esLine[1] = esLine[1].splitPerserveQuotedCommas();
    this.pullTime = esLine[0];
    var pullInfo = esLine[1].splitPerserveQuotedCommas();
    //this.startDate = esLine[0].substr(0,esLine[0].lastIndexOf(':'));
    this.name = pullInfo[2].removeExtraQuotes();
    this.encounterID = parseInt(pullInfo[1]);
    //this.mobs = new Map();//key is a mobs name(string), value is a EncounterMob object
    this.mobs = [];
    this.mobsToIgnore = [];//array of mob names that we need to ignore
    this.setupVisuals = function(){};
    this.encounterWon = false;//assume a wipe until provern otherwise
    this.raidSize = parseInt(pullInfo[4]);
    this.difficulty;
    this.fightLength;
    this.phases = [];
    this.encounterDescription = "No encounter description.";
    
    if(pullInfo[3] === "17" || pullInfo[3] === "0")//HFC LFR
        this.difficulty = 0;
    else if(pullInfo[3] === "14" || pullInfo[3] === "1")//normal
        this.difficulty = 1;
    else if(pullInfo[3] === "15" || pullInfo[3] === "2")//heroic
        this.difficulty = 2;
    else if(pullInfo[3] === "16" || pullInfo[3] === "3")//mythic
        this.difficulty = 3;
    else
    {
        console.log("Encounter Constructor: Unknown difficulty code(lfr? dungeon?): "+ pullInfo[3]);
        this.difficulty = 0;
    }
    
    this.isMythic = function()
    {
        return this.difficulty === 3;
    };
    this.isHeroic = function()
    {
        return this.difficulty === 2;
    };
    this.actorRemovalTest = function(actor)
    {
        for(var s of this.mobsToIgnore)
        {
            if(actor.name === s)
                return true;
        }
        return false;
    };
    this.addPhase = function(phaseNumber, color, time)
    {
        if(color === "red")
            color = "rgb(130,0,0)";
        else if(color === "yellow")
            color = "rgb(184,184,0)";
        else if(color === "green")
            color = "rgb(0,140,0)";
        else if(color === "purple")
            color = "rgb(134,73,184)";
        else if(color === "orange")
            color = "rgb(196,85,7)";
        else if(color === "blue")
            color = "rgb(73,103,184)";
        
        this.phases.push({phase:phaseNumber, color:color, time:time});
        this.phases.sort(function(a,b){
            return a.time-b.time;
        });
    }
    
    
    
    //function, takes as input a Actor, sets it's class value appropriately.
    //actor(actor) the actor to be identified and modified
    this.identifyActor = function(actor)
    {
        var actorGuidParts = actor.guid.split('-');
        var actorID = parseInt(actorGuidParts[actorGuidParts.length-2]);
        for(var mi = 0; mi < this.mobs.length; mi++)
        {
            if(actorID === this.mobs[mi].mobID)
            {
                actor.class = this.mobs[mi].copy();
                return;
            }
        }

        /*for(var mi = 0; mi < this.mobs.length; mi++)
        {
            if(actor.name === this.mobs[mi].name)
            {
                actor.class = this.mobs[mi].copy();
                return;
            }
        }*/
        actor.class = this.mobs[1].copy();//1 should be the unidentified class
        console.log("Encounter.identifyActor: unable to identify mob type: "+actor.name+"("+actorID+")");
    };
    
    this.removeActors = function()
    {
        var actorsPrime = [];
        for(var a of actors)
        {
            if(!this.actorRemovalTest(a))
                actorsPrime.push(a);
        }
        actors = actorsPrime;
    };
    
    this.getJson = function()
    {
        var json = ""
        json += this.fightLength+'@';
        json += this.name+'@';
        json += this.difficulty+'@';
        json += this.raidSize+'@';
        json += ((this.encounterWon)?1:0)+'@';
        json += this.pullTime+'@';
        json += this.encounterID;//added august'17
        return json;
    };
    this.getFileName = function()
    {
        var s = this.pullTime.substr(0, this.pullTime.lastIndexOf(':')) + " " + this.name+" ";
        if(this.difficulty === 0)
            s += "L";
        else if(this.difficulty === 1)
            s += "N";
        else if(this.difficulty === 2)
            s += "H";
        else if(this.difficulty === 3)
            s += "M";
        s += "("+this.raidSize+") ";
        s += timeToString(this.fightLength,0);
        if(!this.encounterWon)
            s += " Wipe";
        return s;
    };
    
    
    this.addGroupSpawnToTimeline = function(mobID, maxTimeWindow)
    {
        maxTimeWindow = maxTimeWindow || 10000;
        var group = lookupActorByID(mobID);
        var spawnTimes = [];
        for(var g of group)
        {
            var foundMatch = false;
            if(g.states.SA.length === 0 || g.states.SA[0] instanceof Death)
            {
                continue;
            }

            for(var j = 0; j < spawnTimes.length; j++)
            {
                if(Math.abs(g.states.SA[0].time - spawnTimes[j]) < maxTimeWindow)
                {
                    if(g.states.SA[0].time < spawnTimes[j])
                        spawnTimes[j] = g.states.SA[0].time;
                    foundMatch = true;
                }
            }
            if(!foundMatch)
                spawnTimes.push(g.states.SA[0].time);
        }
        for(var t of spawnTimes)
        {
            draw.timeline.addIcon(t, group[0].class.icon);//TODO: this needs to be reworked for mobID
        } 
    };
};//Encounter object


//object, functions as the "class" for mobs, has similar fields
//nameIn(string) name of the mob 
//iconName(string) which icon to display as
//isImportant(bool) is this mob one of the main bosses or just trash
var EncounterMob = function(nameIn, iconPath, isImportant, startTime, mobID, preCalcListIndex)
{
    this.name = nameIn;
    this.isImportant = isImportant;
    this.icon = new Image();
    this.iconPath = iconPath;
    this.color = "#9E9E9E";
    this.mobID = mobID||null;
    if(Number.isInteger(preCalcListIndex))
        this.listIndex = preCalcListIndex;
    else
        this.listIndex = playerClassList.length+encounterInfo.mobs.length;
    
    if(iconPath === null)
        this.icon.src = "/icons/encounters/null.png";
    else
        this.icon.src = iconPath;
    
    
    if(startTime !== undefined)
        this.startTime = startTime;
    else
        this.startTime = null;
    
    this.copy = function()
    {
        return new EncounterMob(this.name, this.iconPath, this.isImportant, this.startTime, this.mobID, this.listIndex);
    };
};


//function, called by the parse to identify the encounter and set it up.
//nameIn(string) name of the encounter
//difficultyCode(string) should be "14"-"16" tells if it was normal or mythic
//raidSize(string) how many players were present
//returns an Encounter object
function initEncounter(esLine)
{
    encounterInfo = new Encounter(esLine);
    encounterInfo.mobs.push(new EncounterMob("Environment", "/icons/encounters/missing.jpg", false, null));
    encounterInfo.mobs.push(new EncounterMob("Unidentified", "/icons/encounters/missing.jpg", false, null));
    
    if(encounterInfo.name === "Hellfire Assault" || encounterInfo.encounterID === 1778)
        initHellfireAssault(encounterInfo);
    else if(encounterInfo.name === "Iron Reaver" || encounterInfo.encounterID === 1785)
        initIronReaver(encounterInfo);
    else if(encounterInfo.name === "Kormrok" || encounterInfo.encounterID === 1787)
        initKormrok(encounterInfo);
    else if(encounterInfo.name === "Hellfire High Council" || encounterInfo.encounterID === 1798)
        initHellfireHighCouncil(encounterInfo);
    else if(encounterInfo.name === "Kilrogg Deadeye" || encounterInfo.encounterID === 1786)
        initKilroggDeadeye(encounterInfo);
    else if(encounterInfo.name === "Gorefiend" || encounterInfo.encounterID === 1783)
        initGorefiend(encounterInfo);
    else if(encounterInfo.name === "Shadow-Lord Iskar" || encounterInfo.encounterID === 1788)
        initIskar(encounterInfo);
    else if(encounterInfo.name === "Socrethar the Eternal" || encounterInfo.encounterID === 1794)
        initSocrethar(encounterInfo);
    else if(encounterInfo.name === "Tyrant Velhari" || encounterInfo.encounterID === 1784)
        initVelhari(encounterInfo);
    else if(encounterInfo.name === "Fel Lord Zakuun" || encounterInfo.encounterID === 1777)
        initFelLordZakuun(encounterInfo);
    else if(encounterInfo.name === "Xhul'horac" || encounterInfo.encounterID === 1800)
        initXhulhorac(encounterInfo);
    else if(encounterInfo.name === "Mannoroth" || encounterInfo.encounterID === 1795)
        initMannoroth(encounterInfo);
    else if(encounterInfo.name === "Archimonde" || encounterInfo.encounterID === 1799)
        initArchimonde(encounterInfo);

    else if(encounterInfo.name === "Nythendra" || encounterInfo.encounterID === 1853)
        initNythendra(encounterInfo);
    else if(encounterInfo.name === "Elerethe Renferal" || encounterInfo.encounterID === 1876)
        initElerethe(encounterInfo);
    else if(encounterInfo.name === "Ursoc" || encounterInfo.encounterID === 1841)
        initUrsoc(encounterInfo);
    else if(encounterInfo.name === "Dragons of Nightmare" || encounterInfo.encounterID === 1854)
        initDragonsOfNightmare(encounterInfo);
    else if(encounterInfo.name === "Il'gynoth The Heart of Corruption" || encounterInfo.encounterID === 1873)
        initIlgynoth(encounterInfo);
    else if(encounterInfo.name === "Cenarius" || encounterInfo.encounterID === 1877)
        initCenarius(encounterInfo);
    else if(encounterInfo.name === "Xavius" || encounterInfo.encounterID === 1864)
        initXavius(encounterInfo);
    else if(encounterInfo.name === "Odyn" || encounterInfo.encounterID === 1958)
        initOdyn(encounterInfo);
    else if(encounterInfo.name === "Guarm" || encounterInfo.encounterID === 1962)
        initGuarm(encounterInfo);
    else if(encounterInfo.name === "Helya" || encounterInfo.encounterID === 2008)
        initHelya(encounterInfo);

    else if(encounterInfo.name === "Skorpyron" || encounterInfo.encounterID === 1849)
        initSkorpyron(encounterInfo);
    else if(encounterInfo.name === "Chronomatic Anomaly" || encounterInfo.encounterID === 1865)
        initChronomaticAnomaly(encounterInfo);
    else if(encounterInfo.name === "Trilliax" || encounterInfo.encounterID === 1867)
        initTrilliax(encounterInfo);
    else if(encounterInfo.name === "Spellblade Aluriel" || encounterInfo.encounterID === 1871)
        initAluriel(encounterInfo);
    else if(encounterInfo.name === "Krosus" || encounterInfo.encounterID === 1842)
        initKrosus(encounterInfo);
    else if(encounterInfo.name === "Tichondrius" || encounterInfo.encounterID === 1862)
        initTichondrius(encounterInfo);
    else if(encounterInfo.name === "High Botanist Tel'arn" || encounterInfo.encounterID === 1886)
        initTelarn(encounterInfo);
    else if(encounterInfo.name === "Star Augur Etraeus" || encounterInfo.encounterID === 1863)
        initEtraeus(encounterInfo);
    else if(encounterInfo.name === "Grand Magistrix Elisande" || encounterInfo.encounterID === 1872)
        initElisande(encounterInfo);
    else if(encounterInfo.name === "Gul'dan" || encounterInfo.encounterID === 1866)
        initGuldan(encounterInfo);

    else if(encounterInfo.name === "Goroth" || encounterInfo.encounterID === 2032)
        initGoroth(encounterInfo);
    else if(encounterInfo.name === "Demonic Inquisition" || encounterInfo.encounterID === 2048)
        initDemonicInquisition(encounterInfo);
    else if(encounterInfo.name === "Harjatan" || encounterInfo.encounterID === 2036)
        initHarjatan(encounterInfo);
    else if(encounterInfo.name === "Mistress Sassz'ine" || encounterInfo.encounterID === 2037)
        initSasszine(encounterInfo);
    else if(encounterInfo.name === "Sisters of the Moon" || encounterInfo.encounterID === 2050)
        initSistersOfTheMoon(encounterInfo);
    else if(encounterInfo.name === "The Desolate Host" || encounterInfo.encounterID === 2054)
        initDesolateHost(encounterInfo);
    else if(encounterInfo.name === "Maiden of Vigilance" || encounterInfo.encounterID === 2052)
        initMaidenOfVigilance(encounterInfo);
    else if(encounterInfo.name === "Fallen Avatar" || encounterInfo.encounterID === 2038)
        initFallenAvatar(encounterInfo);
    else if(encounterInfo.name === "Kil'jaeden" || encounterInfo.encounterID === 2051)
        initKiljaeden(encounterInfo);

    else
        console.log("initEncounter: Fight not supported: "+encounterInfo.name);
};

function parseJsonEncounter0(jsonString)
{
    var fightInfo = jsonString.split("@");
    if(fightInfo.length === 6)
    {
        fightInfo.push("0");//if the encounterID is missing(pre-august17), append a 0
        
    }
    else if(fightInfo.length !== 7)
    {
        console.log("parseJsonEncounter0: unexpected amount of fight info");
        return;
    }
    
    //2 - name
    //3 - diff
    //4 - size
    //5 - pullTime
    initEncounter([fightInfo[5],"0,"+fightInfo[6]+","+fightInfo[1]+","+fightInfo[2]+","+fightInfo[3]]);
    encounterInfo.fightLength = parseInt(fightInfo[0]);
    encounterInfo.encounterWon = (fightInfo[4]==='1')?true:false;
};




function removeDowntime(actor, minDuration)
{
    minDuration = 20000 || minDuration;
    if(actor.states.SA.length <= 1)
        return;

    var lastTime = actor.states.SA[0].time;

    for(var si = 1; si < actor.states.SA.length; si++)
    {
        var newTime = actor.states.SA[si].time;
        if(actor.states.SA[si].time - lastTime > minDuration)
        {
            actor.states.SA.splice(si, 0, new Death(lastTime, actor.states.SA));
            si++;
        }
        lastTime = newTime;
    }
};

function drawRaidmarks(aura, actor)
{
    if(spells[aura.spellIndex].id <= -2)
    {
        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
        {
            var auraState = aura.AA[auraStateIndex];
            if(auraState instanceof aura.stateApplied)
            {
                draw.sim.actorVisuals.addStates("raidmark", auraState.time, auraState.endTime-auraState.time,
                    generateRaidmarkOnActor(aura, actor), actor);
            }
        }
    }
};