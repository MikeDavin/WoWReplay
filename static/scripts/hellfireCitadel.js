var initHellfireAssault = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/HellfireAssault/";
    newEncounter.mobs.push(new EncounterMob("Reinforced Hellfire Door", newEncounter.filePath+"Door.jpg", false, null, 90019));
    newEncounter.mobs.push(new EncounterMob("Gorebound Felcaster", newEncounter.filePath+"Felcaster.jpg", false, null, 90409));
    newEncounter.mobs.push(new EncounterMob("Hulking Berserker", newEncounter.filePath+"Berserker.jpg", false, null, 92911));
    newEncounter.mobs.push(new EncounterMob("Iron Dragoon", newEncounter.filePath+"Orc.jpg", false, null, 90114));
    newEncounter.mobs.push(new EncounterMob("Siegemaster Mar'tak", newEncounter.filePath+"Mar'tak.jpg", false, null, 93023));
    newEncounter.mobs.push(new EncounterMob("Contracted Engineer", newEncounter.filePath+"Engineer.jpg", false, null, 93881));
    newEncounter.mobs.push(new EncounterMob("Felfire Demolisher", newEncounter.filePath+"Gears.jpg", false, null, 91103));
    newEncounter.mobs.push(new EncounterMob("Felfire Flamebelcher", newEncounter.filePath+"Gears.jpg", false, null, 90432));
    newEncounter.mobs.push(new EncounterMob("Felfire Artillery", newEncounter.filePath+"Gears.jpg", false, null, 90485));
    newEncounter.mobs.push(new EncounterMob("Grute", newEncounter.filePath+"Berserker.jpg", false, null, 95653));
    newEncounter.mobs.push(new EncounterMob("Grand Corruptor U'rogg", newEncounter.filePath+"GrandCorrupter.jpg", false, null, 95652));
    newEncounter.mobs.push(new EncounterMob("Felfire Crusher", newEncounter.filePath+"Drill.jpg", false, null, 90410));
    newEncounter.mobs.push(new EncounterMob("Felfire Transporter", newEncounter.filePath+"Gears.jpg", false, null, 93434));
    newEncounter.mobs.push(new EncounterMob("Gorebound Siegerider", null, false, null, 92916));
    /*newEncounter.mobs.set("Reinforced Hellfire Door",
        new EncounterMob("Reinforced Hellfire Door", newEncounter.filePath+"Door.jpg", true, 0));
    newEncounter.mobs.set("Gorebound Felcaster",
        new EncounterMob("Gorebound Felcaster", newEncounter.filePath+"Felcaster.jpg", false));
    newEncounter.mobs.set("Hulking Berserker",
        new EncounterMob("Hulking Berserker", newEncounter.filePath+"Berserker.jpg", false));
    newEncounter.mobs.set("Iron Dragoon",
        new EncounterMob("Iron Dragoon", newEncounter.filePath+"Orc.jpg", false));
    newEncounter.mobs.set("Siegemaster Mar'tak",
        new EncounterMob("Siegemaster Mar'tak", newEncounter.filePath+"Mar'tak.jpg", false));
    newEncounter.mobs.set("Contracted Engineer",
        new EncounterMob("Contracted Engineer", newEncounter.filePath+"Engineer.jpg", false));
    newEncounter.mobs.set("Felfire Demolisher",
        new EncounterMob("Felfire Demolisher", newEncounter.filePath+"Gears.jpg", false));
    newEncounter.mobs.set("Felfire Flamebelcher",
        new EncounterMob("Felfire Flamebelcher", newEncounter.filePath+"Gears.jpg", false));
    newEncounter.mobs.set("Felfire Artillery",
        new EncounterMob("Felfire Artillery", newEncounter.filePath+"Gears.jpg", false));
    newEncounter.mobs.set("Grute",
        new EncounterMob("Grute", newEncounter.filePath+"Berserker.jpg", false));
    newEncounter.mobs.set("Grand Corruptor U'rogg",
        new EncounterMob("Grand Corruptor U'rogg", newEncounter.filePath+"GrandCorrupter.jpg", false));
    newEncounter.mobs.set("Felfire Crusher",
        new EncounterMob("Felfire Crusher", newEncounter.filePath+"Drill.jpg", false));
    newEncounter.mobs.set("Felfire Transporter",
        new EncounterMob("Felfire Transporter", newEncounter.filePath+"Gears.jpg", false));
    newEncounter.mobs.set("Gorebound Siegerider",
        new EncounterMob("Gorebound Siegerider", null, false));*/
    newEncounter.mobsToIgnore = ["Gorebound Terror"];
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"courtyard.png", 0.7, 269.8, -4178);
    newEncounter.encounterDescription = "No visual effects for Hellfire Assault.";
    newEncounter.setupVisuals = function()
    {
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(a)
            {
                drawRaidmarks(a, actor);
            });
        }
    };
};

//function, sets up the icons and imp. auras for the Iron Reaver encounter
var initIronReaver = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/IronReaver/";
    newEncounter.mobs.push(new EncounterMob("Iron Reaver", newEncounter.filePath+"IronReaver.jpg", true, 0, 90284));
    newEncounter.mobs.push(new EncounterMob("Volatile Firebomb", newEncounter.filePath+"Firebomb.jpg", false, null, 93717));
    newEncounter.mobs.push(new EncounterMob("Quick-Fuse Firebom", newEncounter.filePath+"QuickfuseFirebomb.jpg", false, null, 94312));
    newEncounter.mobs.push(new EncounterMob("Burning Firebomb", newEncounter.filePath+"BurningFirebomb.jpg", false, null, 94322));
    newEncounter.mobs.push(new EncounterMob("Reinforced Firebomb", newEncounter.filePath+"ReinforcedFirebomb.jpg", false, null, 94955));
    newEncounter.mobs.push(new EncounterMob("Reactive Firebomb", newEncounter.filePath+"ReactiveFirebomb.jpg", false, null, 94326));
    /*newEncounter.mobs.set("Iron Reaver",
            new EncounterMob("Iron Reaver", newEncounter.filePath+"IronReaver.jpg", true, 0));
    newEncounter.mobs.set("Volatile Firebomb",
            new EncounterMob("Volatile Firebomb", newEncounter.filePath+"Firebomb.jpg", false));
    newEncounter.mobs.set("Quick-Fuse Firebomb",
            new EncounterMob("Quick-Fuse Firebomb", newEncounter.filePath+"QuickfuseFirebomb.jpg", false));
    newEncounter.mobs.set("Burning Firebomb",
            new EncounterMob("Burning Firebomb", newEncounter.filePath+"BurningFirebomb.jpg", false));
    newEncounter.mobs.set("Reinforced Firebomb",
            new EncounterMob("Reinforced Firebomb", newEncounter.filePath+"ReinforcedFirebomb.jpg", false));
    newEncounter.mobs.set("Reactive Firebomb",
            new EncounterMob("Reactive Firebomb", newEncounter.filePath+"ReactiveFirebomb.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"courtyard.png", 0.7, 269.8, -4178);
    newEncounter.encounterDescription = "<li><b>Artillery</b>: A large red warning circle is placed around the target, and a timer icon is drawn on top of the player. High accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Barrage</b>: A red cone is drawn from the boss in the opposite direction of her movement. Medium accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Blitz</b>: A red line is drawn on the ground where she's about to dash. High accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Fuel Streak</b>: A red line is drawn estimating where the boss fill fly over next. Low accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Falling Slam</b>: A large red circle shows where the boss is about to land to restart phase one. High accuracy.</li>";

    
    newEncounter.actorRemovalTest = function(a)
    {
        return (a.name === "Iron Reaver" && a.states.SA.length <= 2);
    }
    
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1,"green",0);
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];//aura[0] is the key to the map entry
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 182280)//182280 - Artillery
                {
                    for(var as of aura.AA)
                    {  
                        if(as instanceof aura.stateApplied)//time and endTime
                        {
                            draw.sim.lowerVisuals.addStates("artilleryCircle",as.time, as.endTime-as.time,
                                generateCircleOnActor(20,"rgba(255,0,0,.4)", actor));
                            draw.sim.upperVisuals.addStates("artilleryIcon",as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura, actor));
                        }//if stateApplied
                    }//for aura states
                }//if aura 
            }//for auras
            if(actor.name === "Iron Reaver")
            {
                for(var aura of actor.auras.AM)
                {
                    aura = aura[1];
                    if(spells[aura.spellIndex].id === 182055)//full charge(p2)
                    {
                        for(as of aura.AA)
                        {
                            if(as instanceof aura.stateApplied)
                            {
                                this.addPhase(2,"yellow", as.time);
                            }
                            else if(as instanceof aura.stateRemoved)
                            {
                                this.addPhase(1,"green", as.time);
                            }
                        }
                    }
                }
                for(var cast of actor.casts.CA) 
                {                               //firebomb = 181999
                    if(spells[cast.spellIndex].id === 179889)// Blitz
                    {
                        draw.timeline.addCast(cast);
                        var duration = 4200;
                        var startLoc = actor.getStateAtTime(cast.time);
                        var endLoc = actor.getStateAtTime(cast.time + duration);
                        draw.sim.lowerVisuals.addStates("blitzLine",startLoc.time, duration,
                            generateLineBetweenPoints(startLoc.x, startLoc.y,
                                endLoc.x, endLoc.y, "rgba(255,0,0,0.4)", 20));
                    }
                    if(spells[cast.spellIndex].id === 182668)// Fuel Streak, immolation is 179896
                    {
                        var duration = 13000;
                        var startOffset = 6500;
                        var flightTime = 4300;
                        var startLoc = actor.getStateAtTime(cast.time+ startOffset);
                        var endLoc = actor.getStateAtTime(cast.time + startOffset + flightTime);
                        draw.sim.lowerVisuals.addStates("FuelStreak",cast.time, duration,
                            generateLineBetweenPoints(startLoc.x, startLoc.y,
                                endLoc.x, endLoc.y, "rgba(255,0,0,0.4)", 40));
                    }
                    if(spells[cast.spellIndex].id === 182066)// Falling Slaam
                    {
                        var loc = actor.getStateAtTime(cast.time + cast.castLength);
                        draw.sim.lowerVisuals.addStates("fallingSlam",cast.time, cast.castLength,
                                generateCircleOnLocation(20,"rgba(255,0,0,.4)", loc.x, loc.y));
                    }
                    if(spells[cast.spellIndex].id === 185282) //Barrage
                    {
                        var startState = actor.getStateAtTime(cast.time);
                        var endState = actor.getStateAtTime(cast.time+cast.castLength);
                        var dir = getAngleBetweenPoints(endState.x, endState.y, startState.x, startState.y);
                        
                        draw.timeline.addCast(cast);
                        draw.sim.lowerVisuals.addStates("barrage",cast.time, cast.castLength+1400,
                            generateConeOnActor(actor, dir, Math.PI/4.5, 80, "RGBA(255,0,0,.4"));
                            //                  actor,     dir, width,     radius, color)
                    }
                }//for casts
            }//if actor Iron Reaver
        }//for guids
    };
};

var initKormrok = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Kormrok/";
    newEncounter.mobs.push(new EncounterMob("Kormrok", newEncounter.filePath+"Kormrok.jpg", true, 0, 90435));
    newEncounter.mobs.push(new EncounterMob("Dragging Hand", newEncounter.filePath+"Hand.jpg", false, null, 93839));
    newEncounter.mobs.push(new EncounterMob("Crushing Hand", newEncounter.filePath+"Hand.jpg", false, null, 91368));
    /*newEncounter.mobs.set("Kormrok",
            new EncounterMob("Kormrok",newEncounter.filePath+"Kormrok.jpg", true, 0));
    newEncounter.mobs.set("Dragging Hand",
            new EncounterMob("Dragging Hand", newEncounter.filePath+"Hand.jpg", false));
    newEncounter.mobs.set("Crushing Hand",
            new EncounterMob("Crushing Hand", newEncounter.filePath+"Hand.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"kormrok.png", 0.433, 73, -4437);
    newEncounter.encounterDescription = "No visual effects for Kormrok.";
    
    newEncounter.setupVisuals = function()
    {
        var kormrok = lookupActorByID(90435)[0];//kormork
        if(!kormrok)
            return;
        var phaseStarts = [];
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
            });
        }
        for(var aura of kormrok.auras.AM)
        {
            aura = aura[1];

            if(spells[aura.spellIndex].id === 189197 || spells[aura.spellIndex].id === 180115 ||
                    spells[aura.spellIndex].id === 186879)//purple
            {
                for(var as of aura.AA)
                {
                    if(as instanceof aura.stateApplied)
                        this.addPhase(3,"purple", as.time);
                }
                
            }
            else if(spells[aura.spellIndex].id === 180116|| spells[aura.spellIndex].id === 189198 ||
                    spells[aura.spellIndex].id === 186880)//orange
            {
                for(var as of aura.AA)
                {
                    if(as instanceof aura.stateApplied)
                        this.addPhase(2,"orange", as.time);
                }
            }
            else if(spells[aura.spellIndex].id === 180117 || spells[aura.spellIndex].id === 189199 ||
                    spells[aura.spellIndex].id === 186881)//green
            {
                for(var as of aura.AA)
                {
                    if(as instanceof aura.stateApplied)
                        this.addPhase(1,"green", as.time);
                }
            }
        }
        for(var c of kormrok.casts.CA)
        {
            if(spells[c.spellIndex].id === 180244 ||//pound
                    spells[c.spellIndex].id === 181300 ||spells[c.spellIndex].id === 181299 ||//dragging/grasping hands
                    spells[c.spellIndex].id === 180385 || spells[c.spellIndex].id === 181297 ||//norm/emp. runes
                    spells[c.spellIndex].id === 181292 || spells[c.spellIndex].id === 181293)
                draw.timeline.addCast(c);

        }
    };
};

var initHellfireHighCouncil = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/HellfireHighCouncil/";
    newEncounter.mobs.push(new EncounterMob("Gurtogg Bloodboil", newEncounter.filePath+"Gurtogg.jpg", true, 0, 92146));
    newEncounter.mobs.push(new EncounterMob("Blademaster Jubei'thos", newEncounter.filePath+"Blademaster.jpg", true, 0, 92142));
    newEncounter.mobs.push(new EncounterMob("Dia Darkwhisper", newEncounter.filePath+"Darkwhisper.jpg", true, 0, 92144));
    newEncounter.mobs.push(new EncounterMob("Blademaster Jubei'thos", newEncounter.filePath+"Blademaster.jpg", false, null, 93713));//felstorm clones
    newEncounter.mobs.push(new EncounterMob("Blademaster Jubei'thos", null, false, null, 94427));//enrage clones?
    /*newEncounter.mobs.set("Gurtogg Bloodboil",
            new EncounterMob("Gurtogg Bloodboil",newEncounter.filePath+"Gurtogg.jpg", true, 0));
    newEncounter.mobs.set("Blademaster Jubei'thos",
            new EncounterMob("Blademaster Jubei'thos", newEncounter.filePath+"Blademaster.jpg", true, 0));
    newEncounter.mobs.set("Dia Darkwhisper",
            new EncounterMob("Dia Darkwhisper", newEncounter.filePath+"Darkwhisper.jpg", true, 0));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"council and kilrogg.png", 0.52, -32, -3883);

    newEncounter.encounterDescription = "<li><b>Bloodboil</b>: Red lines are drawn to the 5 players who receive stacks of the debuff each cast. Total stacks are shown in red numbers on the players. High accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Mark of the Necromancer</b>: Debuff icons show who has the debuff. Timer counts down to the debuff increasing in strength, or it being removed. High accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Reap</b>: Purple circles are drawn under the players who get their marks removed by reap. High accuracy.</li>";
    newEncounter.encounterDescription += "<li>The phases on the timeline change when one of the bosses is killed.</li>";
    
    /*newEncounter.actorRemovalTest = function(a)
    {
        return (a.name === "Blademaster Jubei'thos" && a.states.SA.length <= 2) ||
                   (a.name ==="Windwalk");
    }*/
    
    
    newEncounter.setupVisuals = function()
    {
        var dia = lookupActorByID(92144)[0];
        var gurtogg = lookupActorByID(92146)[0];
        var blade = lookupActorByID(92142)[0];
        var bossDeaths = [];

        this.addPhase(1,"green",0);
        
        if(dia.states.SA[dia.states.SA.length-1].curHP <= 1)
        {
            for(var i = dia.states.SA.length-2; i > 0; i--)
            {
                if(dia.states.SA[i].curHP > 2)
                {
                    bossDeaths.push(dia.states.SA[i+1]);
                    break;
                }
            }
        }
        if(gurtogg.states.SA[gurtogg.states.SA.length-1].curHP <= 1)
        {
            for(var i = gurtogg.states.SA.length-2; i > 0; i--)
            {
                if(gurtogg.states.SA[i].curHP > 2)
                {
                    bossDeaths.push(gurtogg.states.SA[i+1]);
                    break;
                }
            }
        }
        if(blade.states.SA[blade.states.SA.length-1].curHP <= 1)
        {
            for(var i = blade.states.SA.length-2; i > 0; i--)
            {
                if(blade.states.SA[i].curHP > 2)
                {
                    bossDeaths.push(blade.states.SA[i+1]);
                    break;
                }
            }
        }
        bossDeaths.sort(function(a,b){return a.time-b.time;});
        if(bossDeaths[0])
            this.addPhase(2,"yellow", bossDeaths[0].time);
        if(bossDeaths[1])
            this.addPhase(3,"red", bossDeaths[1].time);
        
        
        var reapTimes = [];
        for(var c of dia.casts.CA)
        {
            if(spells[c.spellIndex].id === 184476)//reap
            {   
                draw.timeline.addCast(c);
                reapTimes.push(c.time + c.castLength);
            }
        }
        for(var c of gurtogg.casts.CA)
        {
            if(spells[c.spellIndex].id === 184358)//fixate
            {
                draw.timeline.addCast(c);
            }
        }
        for(var c of blade.casts.CA)
        {
            if(spells[c.spellIndex].id === 183885)//mirror images
            {
                draw.timeline.addCast(c);
            }
        }
        
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 184676 || spells[aura.spellIndex].id === 184449 || spells[aura.spellIndex].id === 184450
                        || spells[aura.spellIndex].id === 185065 || spells[aura.spellIndex].id === 185066) //mark of the necromancer
                {
                    for(var as of aura.AA)
                    {  
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("MOTNIcon",as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura, actor));
                        }//if stateApplied
                        else if(as instanceof aura.stateRemoved)
                        {
                            for(rt of reapTimes)
                            {
                                if(Math.abs(as.time - rt) <= 50)
                                {
                                    var loc = actor.getStateAtTime(as.time);
                                    draw.sim.lowerVisuals.addStates("MOTNVoidZone",as.time,
                                        //lasts the entire fight on mythic, 90s otherwise
                                        this.isMythic()?encounterInfo.fightLength:90000,
                                        generateCircleOnLocation(4.0,"rgba(216,91,255,.4)", loc.x, loc.y));
                                }
                            }//reap Times
                        }//if stateRemoved
                    }//for aura states
                }//if Mark of the Necromancer
                else if(spells[aura.spellIndex].id === 184355)//bloodboil
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Bloodboil Stacks", as.time, as.endTime-as.time,
                                generateStackCountOnActor(aura, actor, "rgb(255,0,0)"));
                        }
                        if(as instanceof aura.stateApplied || as instanceof aura.stateStack)
                        {
                            draw.sim.upperVisuals.addStates("BloodboilLines", as.time, 1000,
                               generateLineBetweenActors(gurtogg, actor,"rgba(255,0,0,0.4", 3));
                        }
                    }//for aura states
                }//if bloodboil
            }//for auras
        }//for guids 
    };//setupVisuals()
    
    //overload Identify Actors so that the mirror images don't get marked as important 
    /*newEncounter.identifyActor = function(actor)
    {
        if(this.mobs.has(actor.name))
        {
            if(this.mobs.has(actor.name))
            {
                actor.class = this.mobs.get(actor.name).copy();
            }
            if(actor.name === "Blademaster Jubei'thos")
            {
                if(actor.states.SA[1].time > 60000)
                {
                    actor.class.isImportant = false;
                    actor.class.startTime = null;
                }
            }
        }
        else
        {
            console.log("Encounter.identifyActor: unable to identify mob type: "+actor.name);
            actor.class = new EncounterMob(actor.name, "missing", false, null);
        }
    };*/
};

var initKilroggDeadeye = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Kilrogg/";
    newEncounter.mobs.push(new EncounterMob("Kilrogg Deadeye", newEncounter.filePath+"Kilrogg.jpg", true, 0, 90378));
    newEncounter.mobs.push(new EncounterMob("Salivating Bloodthirster", newEncounter.filePath+"Orc.jpg", false, null, 90521));
    newEncounter.mobs.push(new EncounterMob("Hulking Terror", newEncounter.filePath+"Berserker.jpg", false, null, 93369));
    newEncounter.mobs.push(new EncounterMob("Fel Blood Globule", newEncounter.filePath+"GreenBlood.jpg", false, null, 90513));
    newEncounter.mobs.push(new EncounterMob("Fel Puddle", null, false, null, 91647));//this is new?
    newEncounter.mobs.push(new EncounterMob("Blood Globule", newEncounter.filePath+"RedBlood.jpg", false, null, 90477));
    newEncounter.mobs.push(new EncounterMob("Hellblaze Fiend", newEncounter.filePath+"Fiend.jpg", false, null, 90411));
    newEncounter.mobs.push(new EncounterMob("Hellblaze Imp", newEncounter.filePath+"Imp.jpg", false, null, 90407));
    newEncounter.mobs.push(new EncounterMob("Hellblaze Mistress", newEncounter.filePath+"Mistress.jpg", false, null, 90414));
    /*newEncounter.mobs.set("Kilrogg Deadeye",
            new EncounterMob("Kilrogg Deadeye", newEncounter.filePath+"Kilrogg.jpg", true, 0));
    newEncounter.mobs.set("Salivating Bloodthirster",
            new EncounterMob("Salivating Bloodthirster",newEncounter.filePath+"Orc.jpg",false));
    newEncounter.mobs.set("Hulking Terror",
            new EncounterMob("Hulking Terror",newEncounter.filePath+"Berserker.jpg",false));
    newEncounter.mobs.set("Blood Globule",
            new EncounterMob("Blood Globule",newEncounter.filePath+"RedBlood.jpg",false));
    newEncounter.mobs.set("Fel Blood Globule",
            new EncounterMob("Fel Blood Globule",newEncounter.filePath+"GreenBlood.jpg",false));
    newEncounter.mobs.set("Hellblaze Imp",
            new EncounterMob("Hellblaze Imp",newEncounter.filePath+"Imp.jpg",false));
    newEncounter.mobs.set("Hellblaze Fiend",
            new EncounterMob("Hellblaze Fiend",newEncounter.filePath+"Fiend.jpg",false));
    newEncounter.mobs.set("Hellblaze Mistress",
            new EncounterMob("Hellblaze Mistress",newEncounter.filePath+"Mistress.jpg",false));*/
    newEncounter.mobsToIgnore = ["Vision of Death Stalker", null];
    newEncounter.encounterDescription = "<li><b>Heart Seeker</b>: The target is indicated by a red line pointing from the boss. The resulting voidzone is drawn as a red circle, placed under where the blood add spawns. Medium Accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Vision of Death</b>: The smaller map shows the players sent down to the Vision of Death room, along with the adds they fight. Since 7.0, combat data is no longer generated between rooms, leaving this broken. Low Accuracy.</li>";

    if(draw)
    {
        /*draw.sim = new DoubleSimControl(80, function(actor)
        {
            if(actor.name === "Hellblaze Imp" || actor.name === "Hellblaze Fiend" || actor.name === "Hellblaze Mistress" ||
                (actor.class instanceof PlayerClass && actor.getAuraStateNow(181488)))//Vision of Death
            {
                return false;
            }
            else
                return true;
        });*/
        draw.sim/*.primary*/.setMap(newEncounter.filePath+"council and kilrogg.png", 0.52, -32, -3883);
        //draw.sim.secondary.setMap(newEncounter.filePath+"council and kilrogg.png", 0.52, -32, -3883);
    }
    
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1,"green",0);
        var kilrogg = lookupActorByID(90378)[0];//kilrogg
        for(var c of kilrogg.casts.CA)
        {
            if(spells[c.spellIndex].id === 182428 || spells[c.spellIndex].id === 180372//vision of death, heart seeker
                    || spells[c.spellIndex].id === 180224)//death throws
            {
                draw.timeline.addCast(c);
            }
        }
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 188929)//heart seeker
                for(var as of aura.AA)
                {
                    if(as instanceof aura.stateApplied)
                    {
                        
                        draw.sim/*.primary*/.lowerVisuals.addStates("Heart Seeker Line",as.time, as.endTime - as.time,
                            generateLineBetweenActors(actor, actors[aura.source], "rgba(255,0,0,0.4)", 3));
                        draw.sim/*.primary*/.upperVisuals.addStates("Heart Seeker Icon", as.time, as.endTime - as.time,
                            generateAuraIconOnActor(aura, actor));
                        
                    }
                }
            }
            if(actor.name === "Blood Globule" || actor.name === "Fel Blood Globule")
            {
                var firstState = actor.states.SA[1];
                draw.sim/*.primary*/.lowerVisuals.addStates("Heart Seeker voidzone", firstState.time, encounterInfo.fightLength+1,
                    generateCircleOnLocation(5, "rgba(255,0,0,0.4)",firstState.x, firstState.y ));
            }
        }
    };
};

var initGorefiend = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Gorefiend/";
    newEncounter.mobs.push(new EncounterMob("Gorefiend", newEncounter.filePath+"Gorefiend.jpg", true, 0, 90199));
    newEncounter.mobs.push(new EncounterMob("Corrupted Soul", newEncounter.filePath+"CorruptedSoul.jpg", false, null, 93288));//m ghost adds?
    newEncounter.mobs.push(new EncounterMob("Gorebound Construct", newEncounter.filePath+"Skeleton.jpg", false, null, 90508));//room skele
    newEncounter.mobs.push(new EncounterMob("Gorebound Spirit", newEncounter.filePath+"Berserker.jpg", false, null, 90570));//room tank add
    newEncounter.mobs.push(new EncounterMob("Gorebound Essence", newEncounter.filePath+"Essence.jpg", false, null, 90568));//room healing add
    newEncounter.mobs.push(new EncounterMob("Unstable Soul", newEncounter.filePath+"UnstableSoul.jpg", false, null, 93059));//p2 ghosts
    newEncounter.mobs.push(new EncounterMob("Enraged Spirit", newEncounter.filePath+"Berserker.jpg", false, null, 90385));//stomach tank add
    newEncounter.mobs.push(new EncounterMob("Shadowy Construct", newEncounter.filePath+"Skeleton.jpg", false, null, 90387));//stomach skele
    newEncounter.mobs.push(new EncounterMob("Tortured Essence", newEncounter.filePath+"Essence.jpg", false, null, 90388));

    /*newEncounter.mobs.set("Gorefiend",
            new EncounterMob("Gorefiend", newEncounter.filePath+"Gorefiend.jpg", true, 0));
    newEncounter.mobs.set("Gorebound Spirit",
            new EncounterMob("Gorebound Spirit", newEncounter.filePath+"Berserker.jpg", false));//room tank add
    newEncounter.mobs.set("Enraged Spirit",
            new EncounterMob("Enraged Spirit", newEncounter.filePath+"Berserker.jpg", false));//stomach tank add
    newEncounter.mobs.set("Shadowy Construct",
            new EncounterMob("Shadowy Construct", newEncounter.filePath+"Skeleton.jpg", false));//stomach skele
    newEncounter.mobs.set("Gorebound Construct",
            new EncounterMob("Gorebound Construct", newEncounter.filePath+"Skeleton.jpg", false));//room skele
    newEncounter.mobs.set("Tortured Essence",
            new EncounterMob("Tortured Essence", newEncounter.filePath+"Essence.jpg", false));//stomach healing add
    newEncounter.mobs.set("Gorebound Essence",
            new EncounterMob("Gorebound Essence", newEncounter.filePath+"Essence.jpg", false));//room healing add
    newEncounter.mobs.set("Unstable Soul",
            new EncounterMob("Unstable Soul", newEncounter.filePath+"UnstableSoul.jpg", false));//p2 ghosts
    newEncounter.mobs.set("Corrupted Soul",
            new EncounterMob("Corrupted Soul", newEncounter.filePath+"CorruptedSoul.jpg", false));//supposedly the mythic adds*/
    newEncounter.mobsToIgnore = ["Captured Prisoner", "Tainted Soul", null];

    newEncounter.encounterDescription = "<li><b>Gorefiend's Stomach</b>: The smaller purple map shows the players and adds active in Gorefiend's Stomach. Since 7.0, combat data is no longer recorded between different rooms, breaking this. Low accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Shared Fate</b>: Blue lines are drawn from the rooted player to those that must stack to dispel this, the debuff icon on the primary target counts down until it is removed. High accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Touch of Doom</b>: Icons are drawn on the players targeted by this, white circles are drawn under them if the debuff is active for its normal duration. High accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Shadow of Death</b>: Icons are drawn on the targets of this spell. High accuracy.</li>";

    if(draw)
    {
        /*draw.sim = new DoubleSimControl(80, function(actor)
        {
            if(actor.name === "Enraged Spirit" || actor.name === "Shadowy Construct" || actor.name === "Tortured Essence" ||
                (actor.class instanceof PlayerClass && actor.getAuraStateNow(181295)))//digest
            {
                return false;
            }
            else
                return true;
        });*/
        draw.sim/*.primary*/.setMap(newEncounter.filePath+"gorefiend.png", 0.505, 25, -4098);
        //draw.sim/*.secondary*/.setMap(newEncounter.filePath+"goreStomach.png", 0.505, 25, -4098, "rgb(19,2,33)");
    }
    newEncounter.setupVisuals = function()
    {
        var gore = lookupActorByID(90199)[0];//gorefiend
        this.addPhase(1,"green", 0);
        for(var aura of gore.auras.AM)
        {
            aura = aura[1];
            if(spells[aura.spellIndex].id === 181973)//feast of souls
            {
                for(var as of aura.AA)
                {
                    if(as instanceof aura.stateApplied)
                    {
                        this.addPhase(2,"yellow", as.time);
                    }
                    else if(as instanceof aura.stateRemoved)
                    {
                        this.addPhase(1,"green", as.time);
                    }
                }
            }
        }
        for(var c of gore.casts.CA)
        {
            if(spells[c.spellIndex].id === 182170 || spells[c.spellIndex].id === 181085)//touch of doom, shared fate
            {
                draw.timeline.addCast(c);
            }
        }
        //find the m spirits and set their icon to the player that got banished
        /*for(var possibleSoul of actors)
        {
            if(possibleSoul.class.name === "Unidentified")
            {
                //find all the actors with the same name as this unidentified actor
                //this ghost will still have xrealm names appended, remove if present
                var lookupName = possibleSoul.name;
                if(lookupName.indexOf('-') !== -1)
                    lookupName = lookupName.substr(0, lookupName.indexOf('-'));
                var sameNames = lookupActorasdfasdfasdf(lookupName);
                for(var a2 of sameNames)
                {
                    if(a2.class instanceof PlayerClass)
                    {
                        possibleSoul.class = this.mobs.get("Corrupted Soul").copy();
                        possibleSoul.class.icon = a2.class.icon;
                        var startTime = possibleSoul.states.SA[0].time
                        var endTime = possibleSoul.states.SA[possibleSoul.states.SA.length-1].time
                        draw.sim.primary.upperVisuals.addStates("Corrupted Soul Cover", startTime, endTime-startTime,
                            generateCircleOnActor(null,"rgba(12,255,230,0.5",possibleSoul));
                    }
                }
            }
        }*/
    
        var sharedFateRoots = [];
        var sharedFateTethers = [];
        
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 179977) //Touch of Doom(voidzone debuff)
                {
                    for(var as of aura.AA)
                    {  
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim/*.primary*/.upperVisuals.addStates("Touch Of Doom Icon",as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura, actor));
                            //after touch of doom falls off, see if the actor is standing in a doom well
                            //to make sure the voidzone was created and not immuned off
                            if(actor.auras.getStateAtTime(179995,as.endTime+500)) //doom well
                            {
                                var vzLoc = actor.getStateAtTime(as.endTime);
                                draw.sim/*.primary*/.lowerVisuals.addStates("Touch of Doom Voidzone", as.endTime, encounterInfo.fightLength,
                                    generateCircleOnLocation(7, "rgba(196,236,255,0.4)",vzLoc.x, vzLoc.y ));
                            }
                        }//if applied
                    }//for aura states
                }//if Touch of Doom
                else if(spells[aura.spellIndex].id === 179864) //Shadow of Death(insta kill)
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim/*.primary*/.upperVisuals.addStates("Shadow of Death Icon",as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura, actor));
                        }//if applied
                    }//for auras
                }//if shadow of death
                else if(spells[aura.spellIndex].id === 180148)
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim/*.primary*/.lowerVisuals.addStates("Skele Fixate", as.time, as.endTime-as.time,
                                generateLineBetweenActors(actor, actors[aura.source], "rgba(255,0,0, 0.4", 3));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 179909)//shared fate root
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            var sharedFateInstance = {};
                            sharedFateInstance.player = actor;
                            sharedFateInstance.time = as.time;
                            sharedFateInstance.endTime = as.endTime;
                            sharedFateRoots.push(sharedFateInstance);
                            
                            draw.sim/*.primary*/.upperVisuals.addStates("Shared Fate Root Icon",as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura, actor));
                        }//if state applied
                    }//for aura states
                }//if shared fate root
                else if(spells[aura.spellIndex].id === 179908)//shared fate tether
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            var sharedFateTether = {};
                            sharedFateTether.player = actor;
                            sharedFateTether.time = as.time;
                            sharedFateTethers.push(sharedFateTether);
                        }//if state applied
                    }//for aura states
                }//if shared fate tether
            }//for auras
        }//for guids
        for(var tether of sharedFateTethers)
        {
            for(var root of sharedFateRoots)
            {
                if(Math.abs(tether.time - root.time) <= 100)
                {
                    draw.sim/*.primary*/.lowerVisuals.addStates("Shared Fate Tether", root.time, root.endTime-root.time,
                        generateLineBetweenActors(tether.player, root.player, "rgba(0,0,255, 0.4", 3));
                    break;
                }
            }//for roots
        }//for tethers
    };//setupVisuals
};

var initIskar = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Iskar/";
    newEncounter.mobs.push(new EncounterMob("Shadow-Lord Iskar", newEncounter.filePath+"Iskar.jpg", true, 0, 90316));
    newEncounter.mobs.push(new EncounterMob("Phantasmal Resonance", newEncounter.filePath+"PhantasmalResonance.jpg", false, null, 93625));
    newEncounter.mobs.push(new EncounterMob("Illusionary Outcast", newEncounter.filePath+"ArakoaWarrior.jpg", false, null, 91540));
    newEncounter.mobs.push(new EncounterMob("Corrupted Talonpriest", newEncounter.filePath+"ArakoaCaster.jpg", false, null, 91543));
    newEncounter.mobs.push(new EncounterMob("Shadowfel Warden", newEncounter.filePath+"ArakoaRobot.jpg", false, null, 91541));
    newEncounter.mobs.push(new EncounterMob("Fel Raven", newEncounter.filePath+"FelRaven.jpg", false, null, 91539));
    /*newEncounter.mobs.set("Shadow-Lord Iskar",
            new EncounterMob("Shadow-Lord Iskar", newEncounter.filePath+"Iskar.jpg", true, 0));
    newEncounter.mobs.set("Illusionary Outcast",
            new EncounterMob("Illusionary Outcast", newEncounter.filePath+"ArakoaWarrior.jpg", false));
    newEncounter.mobs.set("Corrupted Talonpriest",
            new EncounterMob("Corrupted Talonpriest", newEncounter.filePath+"ArakoaCaster.jpg", false));
    newEncounter.mobs.set("Shadowfel Warden",
            new EncounterMob("Shadowfel Warden", newEncounter.filePath+"ArakoaRobot.jpg", false));
    newEncounter.mobs.set("Fel Raven",
            new EncounterMob("Fel Raven", newEncounter.filePath+"FelRaven.jpg", false));
    newEncounter.mobs.set("Phantasmal Resonance",
            new EncounterMob("Phantasmal Resonance", newEncounter.filePath+"PhantasmalResonance.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"iskar and fel lord.png", 0.596, -2791, -4352); 
    newEncounter.orb = new Image();
    newEncounter.orb.src = "/icons/encounters/HFC/Iskar/EyeOfAnzu.jpg";
     

    newEncounter.encounterDescription = "<li><b>Orb of Anzu</b>: The icon shows who's holding the orb. It is tracked by who receives stacks of the fire dot it applies. Medium accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Chakram</b>: Orange lines show the path of the chakram between the boss and the targeted players. Medium accuracy.</li>";
    newEncounter.encounterDescription += "<li><b>Phantasmal Winds</b>: Icons show the targeted players, with a countdown until they are removed. High accuracy.</li>";

    
    newEncounter.setupChakram = function()
    {
        //182178 - cast on ranged
        //182200 - double cast first on tank and melee
        //182216 - 5s 'channel' that deals dmg, gets marked as failed then instant.
        
        //182178 - aura placed on ranged
        //182200 - aura placed on melee/tank
        
        var rangedCast = null;
        var meleeCast = null;
        var tankCast = null;
        var castCount = 0;
        var iskar = lookupActorByID(90316)[0];//iskar

        var i = 0;
        for(var c of iskar.casts.CA)
        {
            if(spells[c.spellIndex].id === 182178)
            {
                rangedCast = c;
                castCount++;
            }
            else if(spells[c.spellIndex].id === 182200)
            {
                if(actors[c.target].class.isTank)
                {
                    tankCast = c;
                    castCount++;
                }
                else
                {
                    meleeCast = c;
                    castCount++;
                }
            }
            if(castCount === 3)
            {
                if(rangedCast === null || meleeCast === null || tankCast === null)
                {
                    console.log("setupChakram: missing expected target, skipping this cast.")
                }
                else
                {
                    var lineColor = "rgba(255, 119, 0, 0.7)"
                    draw.sim.lowerVisuals.addStates("Chakram Line - boss to ranged", rangedCast.time, 5000,
                        generateLineBetweenActors(iskar,actors[rangedCast.target],lineColor, 4));
                    draw.sim.lowerVisuals.addStates("Chakram Line - ranged to melee", meleeCast.time, 6000,
                        generateLineBetweenActors(actors[rangedCast.target],actors[meleeCast.target],lineColor, 4));
                    draw.sim.lowerVisuals.addStates("Chakram Line - melee to tank", tankCast.time, 7000,
                        generateLineBetweenActors(actors[meleeCast.target],actors[tankCast.target], lineColor, 4));
                    draw.sim.lowerVisuals.addStates("Chakram Line - tank to boss", tankCast.time, 8000,
                        generateLineBetweenActors(actors[tankCast.target],iskar, lineColor, 4));
                }
                castCount = 0;
                rangedCast = meleeCast = tankCast = null;
            }
        }
    };
    newEncounter.setupOrb = function()
    {
        var orbPossesion = [];
        var insertIntoArray = function(newState)
        {
            for(var i = 0; i < orbPossesion.length; i++)
            {
                if(orbPossesion[i].time > newState.time)
                {
                    var swap = orbPossesion[i];
                    orbPossesion[i] = newState;
                    newState = swap;
                }
            }
            orbPossesion.push(newState);
        };
        
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                if(spells[aura.spellIndex].id === 185239)//Radiance of Anzu - who held the orb
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied || as instanceof aura.stateStack)
                        {
                            insertIntoArray({time:as.time, actor:actor});
                        }
                    }
                }
            }
        }
        if(orbPossesion.length >= 1)
        {
            var startOfHold = orbPossesion[0];
            for(var i = 1; i < orbPossesion.length; i++)
            {
                if(startOfHold.actor !== orbPossesion[i].actor)
                {
                    draw.sim.upperVisuals.addStates("Orb", startOfHold.time, orbPossesion[i].time - startOfHold.time,
                        generateIconOnActor(newEncounter.orb, startOfHold.actor));
                    startOfHold = orbPossesion[i];
                }
            }
            draw.sim.upperVisuals.addStates("Orb", startOfHold.time, encounterInfo.fightLength+1,
                generateIconOnActor(newEncounter.orb, startOfHold.actor));
        }     
    };
    newEncounter.setupVisuals = function()
    {
        this.setupChakram();
        this.setupOrb();
        var iskar = lookupActorByID(90316)[0];//iskar
        this.addPhase(1,"green",0);
        var lastCast = null;
        for(var c of iskar.casts.CA)
        {
            if(spells[c.spellIndex].id === 181873)//shadow escape
            {
                this.addPhase(2,"yellow", c.time);
            }
            else if(spells[c.spellIndex].id === 181912)//focused blast
            {
                lastCast = c;
                draw.timeline.addCast(c);
            }
            else if(spells[c.spellIndex].id === 181956 || spells[c.spellIndex].id === 182178)//winds, chaakram
            {
                draw.timeline.addCast(c);
            }
            else if(lastCast !== null)
            {
                this.addPhase(1,"green", lastCast.time+lastCast.castLength+7000);
                lastCast = null;
            }
        }
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 181957)//Winds
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Winds",as.time, as.endTime - as.time, 
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }
            }
        }
    };
};

var initSocrethar = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Socrethar/";
    newEncounter.mobs.push(new EncounterMob("Soulbound Construct", newEncounter.filePath+"SoulboundConstruct.jpg", true, 0, 90296));
    newEncounter.mobs.push(new EncounterMob("Voracious Soulstalker", newEncounter.filePath+"Soulstalker.jpg", false, null, 95101));
    newEncounter.mobs.push(new EncounterMob("Soul of Socrethar", newEncounter.filePath+"SoulOfSocrethar.jpg", true, null, 92330));
    newEncounter.mobs.push(new EncounterMob("Crystalline Fel Prison", newEncounter.filePath+"Crystal.jpg", false, null, 91765));
    newEncounter.mobs.push(new EncounterMob("Sargerei Dominator", newEncounter.filePath+"Dominator.jpg", false, null, 92767));
    newEncounter.mobs.push(new EncounterMob("Haunting Soul", newEncounter.filePath+"Ghost.jpg", false, null, 91938));
    newEncounter.mobs.push(new EncounterMob("Sargerei Shadowcaller", newEncounter.filePath+"Shadowcaller.jpg", false, null, 91941));

    /*newEncounter.mobs.set("Soulbound Construct",
            new EncounterMob("Soulbound Construct", newEncounter.filePath+"SoulboundConstruct.jpg", true, 0));
    newEncounter.mobs.set("Voracious Soulstalker",
            new EncounterMob("Voracious Soulstalker", newEncounter.filePath+"Soulstalker.jpg", false));
    newEncounter.mobs.set("Soul of Socrethar", 
            new EncounterMob("Soul of Socrethar", newEncounter.filePath+"SoulOfSocrethar.jpg", true));
    newEncounter.mobs.set("Crystalline Fel Prison",
            new EncounterMob("Crystalline Fel Prison", newEncounter.filePath+"Crystal.jpg", false));
    newEncounter.mobs.set("Sargerei Dominator",
            new EncounterMob("Sargerei Dominator", newEncounter.filePath+"Dominator.jpg", false));
    newEncounter.mobs.set("Haunting Soul",
            new EncounterMob("Haunting Soul", newEncounter.filePath+"Ghost.jpg", false));
    newEncounter.mobs.set("Sargerei Shadowcaller",
            new EncounterMob("Sargerei Shadowcaller", newEncounter.filePath+"Shadowcaller.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"soc and velhari.png", 0.735, -2755, -4057); 

    newEncounter.encounterDescription = "<li><b>Controlling the Construct</b>: Tracking the constructs attacks is less reliable while controlled by players. </li>";
    newEncounter.encounterDescription += "<li><b>Reverberating Blow</b>: Red cones are drawn on every target hit by this cast, can look strange when multiple targets are hit. Medium accuracy.</li>"; 
    newEncounter.encounterDescription += "<li><b>Apocalyptic Felburst</b>: Red circles are drawn under each target hit by this cast. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Felblaze Charge</b>: A green line is drawn between the construct's position before and after the cast. Low accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Gift of the Man'ari</b>: Green circles are drawn under the players with this debuff. High accuracy</li>"; 

    
    newEncounter.setupRobotCasts = function()
    {
        var robot = lookupActorByID(90296)[0];//soulbound construct
        var robotsTarget = null;
        var ai = 0;
        
        var coneRadius = 40;
        var coneWidth = Math.PI/4;
        var coneColor = "rgba(255,0,0,0.4)";

        this.addPhase(1,"green", 0);
        var phaseTime = 0;
        var whichPhase = 1;
        for(var s of robot.states.SA)
        {
            if(s.curHP <= 1 && s.time - phaseTime > 5000)
            {
                phaseTime = s.time;
                if(whichPhase === 1)
                {
                    this.addPhase(2,"yellow", s.time);
                    whichPhase = 2;
                }
                else
                {
                    this.addPhase(1,"green", s.time);
                    whichPhase = 1;
                }
            }
        }
        
        for(var a of robot.damageDone.AA)
        {
            if(spells[a.spellIndex].id === 180008 || spells[a.spellIndex].id === 182635)//reverberating blow
            {
                var robotLoc = robot.getStateAtTime(a.time);
                var targetLoc = actors[a.target].getStateAtTime(a.time);
                var dir = getAngleBetweenPoints(robotLoc.x, robotLoc.y, targetLoc.x, targetLoc.y);
                draw.sim.lowerVisuals.addStates("reverbeatingBlow",a.time-2500, 2500,
                    generateConeOnActor(robot, dir, coneWidth, coneRadius, coneColor));

            }
            else if(spells[a.spellIndex].id === 188703 && a.ammount >= 1000000)//Apocalyptic Felburst
            {
                var targetLoc = actors[a.target].getStateAtTime(a.time);
                draw.sim.upperVisuals.addStates("Apocalyptic Felburst Target", a.time-3000, 3000,
                    generateCircleOnLocation(3,"rgba(0,255,0,0.6", targetLoc.x, targetLoc.y));

            }

        }
        for(var c of robot.casts.CA)
        {
            if(/*a.spell.id === "182051" ||*/ spells[c.spellIndex].id === 190161 ||//3s channel, insta-cast on move
                spells[c.spellIndex].id === 182997)//insta-cast for player controlled
            {
                var startLoc = robot.getStateAtTime(c.time);
                var endLoc = robot.getStateAtTime(c.time+1000);
                
                draw.sim.lowerVisuals.addStates("Felblaze Charge fire", c.time, 90000,
                    generateLineBetweenPoints(startLoc.x, startLoc.y, endLoc.x, endLoc.y, "rgba(0,255,0,0.4)",30));
            }
        }
    };
    
    newEncounter.setupVisuals = function()
    {
        this.setupRobotCasts();
        var soc = lookupActorByID(92330)[0];//socrethar
        var dominators = lookupActorByID(92767);//sargeri dominator
        for(var c of soc.casts.CA)
        {
            if(spells[c.spellIndex].id === 183331 && c.didCastSucceed)//exert dominance
            {
                draw.timeline.addCast(c);
            }
        }
        for(var d of dominators)
        {
            for(var c of d.casts.CA)
            {
                if(spells[c.spellIndex].id === 184124)//gift of the man'ari
                {
                    draw.timeline.addCast(c);
                }
            }
        }
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 184124)//Gift of the Man'ari
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Gift of the Man'ari",as.time, as.endTime-as.time,
                                generateCircleOnActor(11,"rgba(25,196,88,0.4)",actor));
                        }
                    }
                }//gift of the man'ari
                else if(spells[aura.spellIndex].id === 182769)//Ghastly Fixation
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Ghost Fixate", as.time, as.endTime-as.time,
                                generateLineBetweenActors(actor,actors[aura.source],"rgba(150,0,196,0.4)",2));
                        }
                    }
                }//ghastly fixation
            }//for auras
        }//for guids
    };//setupVisuals
};

var initVelhari = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Velhari/";
    newEncounter.mobs.push(new EncounterMob("Tyrant Velhari", newEncounter.filePath+"Velhari.jpg", true, 0, 90269));
    newEncounter.mobs.push(new EncounterMob("Ancient Enforcer", newEncounter.filePath+"EnforcerSovereign.jpg", false, null, 90270));
    newEncounter.mobs.push(new EncounterMob("Ancient Harbinger", newEncounter.filePath+"Harbinger.jpg", false, null, 90271));
    newEncounter.mobs.push(new EncounterMob("Ancient Sovereign", newEncounter.filePath+"EnforcerSovereign.jpg", false, null, 90272));
    /*newEncounter.mobs.set("Tyrant Velhari",
            new EncounterMob("Tyrant Velhari", newEncounter.filePath+"Velhari.jpg", true, 0));
    newEncounter.mobs.set("Ancient Enforcer",
            new EncounterMob("Ancient Enforcer", newEncounter.filePath+"EnforcerSovereign.jpg", false));
    newEncounter.mobs.set("Ancient Harbinger",
            new EncounterMob("Ancient Harbinger", newEncounter.filePath+"Harbinger.jpg", false));
    newEncounter.mobs.set("Ancient Sovereign",
            new EncounterMob("Ancient Sovereign", newEncounter.filePath+"EnforcerSovereign.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"soc and velhari.png", 0.735, -2755, -4057); 
    
    newEncounter.encounterDescription = "<li><b>Searing Blaze</b>: Red circles that last 2 seconds are drawn whenever damage is received from Infernal Tempest, Enforcer's Onslaught, or Annihilating Strike. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Annihilating Strike</b>: Narrow red cones are drawn on each target hit by this spell. Medium accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Enforcer's Onslaught</b>: Thick red cones are drawn on each target hit by this spell. Medium accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Edict of Condemnation</b>: 3 shrinking purple circles are placed under the player with this debuff, shrinking as it hits. Medium accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Font of Corruption</b>: Dark purple circles are placed under players while this debuff is active. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Despoiled Ground</b>: Small purple circles are drawn whenever anyone takes damage from these voidzones. Medium accuracy</li>"; 

    newEncounter.setupVisuals = function()
    {
        var velhari = lookupActorByID(90269)[0];//velhari
        var enforcer = lookupActorByID(90270)[0];//enforcer
        var searingBlazeSize = 1;
        var searingBlazeDuration = 2100;
        var red = "rgba(255,0,0,0.6)";
        
        this.addPhase(1, "green",0);
        var phaseCount = 1;
        for(var s of velhari.states.SA)
        {
            if(s.curHP/s.maxHP <= 0.7 && phaseCount === 1)
            {
                this.addPhase(2,"yellow", s.time);
                phaseCount++;
            }
            else if(s.curHP/s.maxHP <= 0.4 && phaseCount === 2)
            {
                this.addPhase(3,"red", s.time);
                break;
            }
        }
        for(var c of velhari.casts.CA)
        {
            if(spells[c.spellIndex].id === 180300 || spells[c.spellIndex].id === 180526 ||//tempest, font
                    spells[c.spellIndex].id === 180608)//gavel
            {
                draw.timeline.addCast(c);
            }
        }
        
        for(var a of enforcer.damageDone.AA)
        {
            if(spells[a.spellIndex].id === 180252)//Roaring Flames
            {
                var enforcerLoc = enforcer.getStateAtTime(a.time);
                var targetLoc = actors[a.target].getStateAtTime(a.time);
                var direction = getAngleBetweenPoints(enforcerLoc.x, enforcerLoc.y, targetLoc.x, targetLoc.y);
                draw.sim.lowerVisuals.addStates("Roaring Flames", a.time-2000, 2000,
                    generateConeOnActor(enforcer, direction, Math.PI/6,30,"rgba(255,0,0,0.4)"));
                draw.sim.upperVisuals.addStates("Searing Blaze", a.time, searingBlazeDuration,
                    generateCircleOnLocation(searingBlazeSize, red, targetLoc.x, targetLoc.y));
            }
        }
        for(var a of velhari.damageDone.AA)
        {
            if(spells[a.spellIndex].id === 180260)//Annihilating Strike
            {
                var velhariLoc = velhari.getStateAtTime(a.time);
                var targetLoc = actors[a.target].getStateAtTime(a.time);
                var direction = getAngleBetweenPoints(velhariLoc.x, velhariLoc.y, targetLoc.x, targetLoc.y);
                draw.sim.lowerVisuals.addStates("Annihilating Strike", a.time-3000, 3000,
                    generateConeOnActor(velhari, direction, Math.PI/16,50,"rgba(255,0,0,0.4)"));
                draw.sim.upperVisuals.addStates("Searing Blaze", a.time, searingBlazeDuration,
                    generateCircleOnLocation(searingBlazeSize, red, targetLoc.x, targetLoc.y));
            }
            else if(spells[a.spellIndex].id === 180604)//Despoiled Ground
            {
                var targetLoc = actors[a.target].getStateAtTime(a.time)
                draw.sim.upperVisuals.addStates("Despoiled Ground", a.time, encounterInfo.fightLength,
                    generateCircleOnLocation(1.6, "rgba(150,0,196,0.4)", targetLoc.x, targetLoc.y));
            }
        }
        for(var c of velhari.casts.CA)
        {
            if(spells[c.spellIndex].id === 180300)//Infernal Tempest, spawn a searing blaze on each player
                                       //as soon as the cast finishes, then 3 more every 1.5s
            {
                for(var actor of actors)
                {
                    if(actor.class instanceof PlayerClass)
                    {
                        var time = c.time + c.castLength;
                        for(var i = 0; i < 4; i++)
                        {
                            var targetLoc = actor.getStateAtTime(time);
                            draw.sim.upperVisuals.addStates("Searing Blaze", time, searingBlazeDuration,
                                generateCircleOnLocation(searingBlazeSize, red, targetLoc.x, targetLoc.y));
                            time += 1500;
                        }
                    }
                }
            }
        }
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 185241)//edict of condemnation
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.timeline.addCast({time:as.time, castLength:0, spellIndex: aura.spellIndex});
                            draw.sim.lowerVisuals.addStates("Large Edict", as.time, 3000,
                                generateCircleOnActor(20,"rgba(150,0,196,0.4)",actor));
                            draw.sim.lowerVisuals.addStates("Medium Edict", as.time+3000, 3000,
                                generateCircleOnActor(12,"rgba(150,0,196,0.4)",actor));
                            draw.sim.lowerVisuals.addStates("Small Edict", as.time+6000, 3000,
                                generateCircleOnActor(6,"rgba(150,0,196,0.4)",actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 185237)//Touch of Harm
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Touch of Harm", as.time, as.endTime - as.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 180526)//Font of Corruption
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Font of Corruption", as.time, as.endTime - as.time,
                                generateCircleOnActor(5,"rgba(0,0,150,0.4)", actor));
                        }
                    }
                }
            }
        }
    };
};

var initFelLordZakuun = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Zakuun/";
    newEncounter.mobs.push(new EncounterMob("Fel Lord Zakuun", newEncounter.filePath+"Zakuun.jpg", true, 0, 89890));
    newEncounter.mobs.push(new EncounterMob("Fel Crystal", null, false, null, 91604));
    newEncounter.mobs.push(new EncounterMob("Residual Energy", null, false, null, 92919));
    /*newEncounter.mobs.set("Fel Lord Zakuun",
            new EncounterMob("Fel Lord Zakuun", newEncounter.filePath+"Zakuun.jpg", true, 0));
    newEncounter.mobs.set("Fel Crystal",
            new EncounterMob("Fel Crystal", null, false));
    newEncounter.mobs.set("Residual Energy",
            new EncounterMob("Residual Energy", null, false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"iskar and fel lord.png", 0.596, -2811, -4342); 

    newEncounter.encounterDescription = "<li><b>Rumbling Fissures</b>: Green circles are drawn where the log detects players leaving a fissure, thus ones that the raid avoided cannot be shown. Medium accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Disembodied</b>: Players in the shadow realm of this fight will be colored blue. Since 7.0 combat data is not transmitted between different rooms of the fight, which breaks this. Low accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Cavitation</b>: Purple lines are drawn to all ranged players in the main room, to show where the cavitations could go. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Befouled</b>: Icons and a red warning circle are drawn on players while this debuff is active. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Seed of Corruption</b>: An icon is put on each player targeted by this. High accuracy</li>"; 
    
    
    newEncounter.setupVisuals = function()
    {
        var zakuun = lookupActorByID(89890)[0];//fel lord zakuun
        var fissureCastTimes = [];
        
        this.addPhase(1,"green", 0);
        for(var a of zakuun.auras.AM)
        {
            a = a[1];
            if(spells[a.spellIndex].id === 179667)//disarmed - p2
            {
                for(var as of a.AA)
                {
                    if(as instanceof a.stateApplied)
                    {
                        this.addPhase(2, "yellow", as.time);
                    }
                    else if(as instanceof a.stateRemoved)
                    {
                        this.addPhase(1, "green", as.time);
                    }
                }
            }
            else if(spells[a.spellIndex].id === 179681)//enrage - p3
            {
                for(var as of a.AA)
                {
                    if(as instanceof a.stateApplied)
                        this.addPhase(3,"red", as.time);
                }
            }
        }
        for(var c of zakuun.casts.CA)
        {
            if(spells[c.spellIndex].id === 189009)//cavitation
            {
                draw.timeline.addCast(c);
                for(var actor of actors)
                {
                    if(!(actor.class instanceof PlayerClass) || (actor.class.isMelee))
                        continue;
                    var as = actor.auras.getStateAtTime(179407,c.time);//disembodied
                    if(as === null)
                    {
                        draw.sim.lowerVisuals.addStates("Cavitation Lines", c.time-2000, 3000,
                            generateLineBetweenActors(zakuun, actor,"rgba(150,0,196,0.4)",1.5 ));
                        
                    }
                }
            }
            else if(spells[c.spellIndex].id === 179583)//spawn Rumbling Fissures
            {
                fissureCastTimes.push(c.time);
            }
            else if(spells[c.spellIndex].id === 181508 || spells[c.spellIndex].id === 181515 ||//seeds
                    spells[c.spellIndex].id === 179709)//fowl
            {
                draw.timeline.addCast(c);
            }
        }
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 182008 || spells[aura.spellIndex].id === 181508 ||//Latent Energy, p2 seeds
                        spells[aura.spellIndex].id === 181515)//p3 seeds
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Latent/seeds icon", as.time, as.endTime - as.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 189032 ||//green befowled
                        spells[aura.spellIndex].id === 189031 ||//orange befowled
                        spells[aura.spellIndex].id === 189030)// red befowled
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("befowled icon", as.time, as.endTime - as.time,
                                generateAuraIconOnActor(aura, actor));
                            draw.sim.lowerVisuals.addStates("befowled warning", as.time, as.endTime - as.time,
                                generateCircleOnActor(6,"rgba(255,0,0,0.4)",actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 179407)//Disembodied
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Disembodied", as.time, as.endTime - as.time,
                                generateCircleOnActor(null,"rgba(0,0,196,0.4)", actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 179428)//Rumbling Fissure
                {
                    for(as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            //find which cast the rumbling fissure belongs to
                            var i;
                            for(i = 0; i < fissureCastTimes.length-1; i++)
                            {
                                if(as.time >= fissureCastTimes[i] && as.time <= fissureCastTimes[i+1])
                                    break;
                            }
                            var loc = actor.getStateAtTime(as.endTime);
                            draw.sim.lowerVisuals.addStates("Fissure", fissureCastTimes[i],
                                as.endTime - fissureCastTimes[i],
                                generateCircleOnLocation(3.5,"rgba(0,255,0,0.4)",loc.x, loc.y));
                        }
                    }
                }
            }
        }   
    };
};

var initXhulhorac = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Xhul/";
    newEncounter.mobs.push(new EncounterMob("Xhul'horac", newEncounter.filePath+"XhulGreen.jpg", true, 0, 93068));
    newEncounter.mobs.push(new EncounterMob("Wild Pyromaniac", newEncounter.filePath+"Imp.jpg", false, null, 94231));
    newEncounter.mobs.push(new EncounterMob("Vanguard Akkelion", newEncounter.filePath+"Akkelion.jpg", false, null, 94185));
    newEncounter.mobs.push(new EncounterMob("Omnus", newEncounter.filePath+"Omnus.jpg", false, null, 94239));
    newEncounter.mobs.push(new EncounterMob("Unstable Voidfiend", newEncounter.filePath+"Voidwalker.jpg", false, null, 94397));
    /*newEncounter.mobs.set("Xhul'horac",
            new EncounterMob("Xhul'horac", newEncounter.filePath+"XhulGreen.jpg", true, 0));
    newEncounter.mobs.set("Vanguard Akkelion",
            new EncounterMob("Vanguard Akkelion", newEncounter.filePath+"Akkelion.jpg", true));
    newEncounter.mobs.set("Omnus",
            new EncounterMob("Omnus", newEncounter.filePath+"Omnus.jpg", true));
    newEncounter.mobs.set("Wild Pyromaniac",
            new EncounterMob("Wild Pyromaniac", newEncounter.filePath+"Imp.jpg", false));
    newEncounter.mobs.set("Unstable Voidfiend",
            new EncounterMob("Unstable Voidfiend", newEncounter.filePath+"Voidwalker.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"xhul.png", 0.4 , -2362, -4274); 
    newEncounter.mobsToIgnore = ["Residual Energy"];


    newEncounter.encounterDescription = "<li><b>Fel Surge and Void Surge</b>: Icons are drawn on the affected players, and the appropriate color circle is drawn on the ground when they drop. The circles last a set amount of time and do not track the fire exploding and despawning. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Volatile Voidstep</b>: Small purple circles show where the voidwalkers will jump to next, larger light purple circles are drawn if someone gets hit. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Black Hole</b>: A large light purple circle is drawn early to show where the black hole will appear, it turns solid when the black hole spawns. Multiple may appear if multiple people soak it. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Chains of Fel</b>: Icons are drawn on the affected players. Red warning circles get added for the Empowered version. High accuracy</li>"; 
    
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(94231);//wild pyromaniac
        cd.addDamageWindow(94397);//unstable voidfiend
    };
    
    newEncounter.setupBlackHoles = function()
    {
        var blackHoleCasts = [];
        var xhul = lookupActorByID(93068)[0];//xhul
        var omnus = lookupActorByID(94239)[0];//omnus
        for(var c of omnus.casts.CA)
        {
            if(spells[c.spellIndex].id === 186546)//black hole
                blackHoleCasts.push(c);
        }
        for(var a of omnus.damageDone.AA)
        {
            if(spells[a.spellIndex].id === 186549)//singularity
            {
                var i;
                for(i = 0; i < blackHoleCasts.length-1; i++)
                {
                    if(a.time > blackHoleCasts[i].time && a.time < blackHoleCasts[i+1].time)
                        break;
                }
                var loc = actors[a.target].getStateAtTime(a.time);
                
                draw.sim.lowerVisuals.addStates("Black Hole Warning", blackHoleCasts[i].time,
                    blackHoleCasts[i].castLength,
                    generateCircleOnLocation(10, "rgba(130,0,166,0.5)", loc.x, loc.y));
                var castEnd = blackHoleCasts[i].time + blackHoleCasts[i].castLength;
                draw.sim.lowerVisuals.addStates("Black Hole", castEnd, a.time - castEnd,
                    generateCircleOnLocation(10, "rgb(130,0,166)", loc.x, loc.y));
            }
        }
        blackHoleCasts = [];
        for(var c of xhul.casts.CA)
        {
            if(spells[c.spellIndex].id === 189779)//emp. black hole
                blackHoleCasts.push(c);
        }
        for(var a of xhul.damageDone.AA)
        {
            if(spells[a.spellIndex].id === 189781)//emp singularity
            {
                var i;
                for(i = 0; i < blackHoleCasts.length-1; i++)
                {
                    if(a.time > blackHoleCasts[i].time && a.time < blackHoleCasts[i+1].time)
                        break;
                }
                var loc = actors[a.target].getStateAtTime(a.time);
                
                draw.sim.lowerVisuals.addStates("Black Hole Warning", blackHoleCasts[i].time,
                    blackHoleCasts[i].castLength,
                    generateCircleOnLocation(10, "rgba(130,0,166,0.5)", loc.x, loc.y));
                var castEnd = blackHoleCasts[i].time + blackHoleCasts[i].castLength;
                draw.sim.lowerVisuals.addStates("Black Hole", castEnd, a.time - castEnd,
                    generateCircleOnLocation(10, "rgb(130,0,166)", loc.x, loc.y));
            }
        }
    }
    newEncounter.setupTimeline = function()
    {
        var xhul = lookupActorByID(93068)[0];//xhul
        var omnus = lookupActorByID(94239)[0];//omnus
        var akkelion = lookupActorByID(94185)[0];//akkelion
        var imps = lookupActorByID(94231);//imps
        this.addPhase(1,"green", 0);
        
        
        
        if(newEncounter.isMythic())
        {
            if(omnus && akkelion)
            {
                var od = omnus.states.SA[omnus.states.SA.length-1];
                var ad = akkelion.states.SA[akkelion.states.SA.length-1];
                if(od instanceof Death && ad instanceof Death)
                {
                    if(od.time < ad.time)
                        this.addPhase(2,"yellow", ad.time);
                    else
                        this.addPhase(2,"yellow", od.time);
                    
                    var xs = xhul.states.SA[xhul.states.SA.length-1];
                    if(xs.curHP/xs.maxHP <= 0.2)
                    {
                        for(var i = xhul.states.SA.length-1; i > 0; i--)
                        {
                            xs = xhul.states.SA[i];
                            if(xs.curHP / xs.maxHP >= 0.2)
                            {
                                this.addPhase(3,"red", xs.time);
                                break;
                            }
                        }
                    }   
                }
            }
        }
        else
        {
            if(omnus)//make sure p2 starts
            {
                this.addPhase(1,"purple", omnus.states.SA[0].time);
                var od = omnus.states.SA[omnus.states.SA.length-1];
                if(od instanceof Death)
                {
                    this.addPhase(2,"yellow", od.time);
                    var xs = xhul.states.SA[xhul.states.SA.length-1];
                    if(xs.curHP/xs.maxHP <= 0.2)
                    {
                        for(var i = xhul.states.SA.length-1; i > 0; i--)
                        {
                            xs = xhul.states.SA[i];
                            if(xs.curHP / xs.maxHP >= 0.2)
                            {
                                this.addPhase(3,"red", xs.time);
                                break;
                            }
                        }
                    }
                }
            }//if omnus is alive
        }//else norm/heroic
        for(var i of imps)
        {
            for(var c of i.casts.CA)
            {
                if(spells[c.spellIndex].id === 186532 && c.didCastSucceed)
                {
                    draw.timeline.addCast(c);
                }
            }
        }//for imps
        for(var c of xhul.casts.CA)
        {
            if(spells[c.spellIndex].id === 189775 || spells[c.spellIndex].id === 189779)//emp chains and blackhole
            {
                if(c.didCastSucceed)
                    draw.timeline.addCast(c);
            }
        }
        for(var c of omnus.casts.CA)
        {
            if(spells[c.spellIndex].id === 186546)//reg black hole
                draw.timeline.addCast(c);
        }
        for(var c of akkelion.casts.CA)
        {
            if(spells[c.spellIndex].id === 186490)//reg chains
                draw.timeline.addCast(c);
        }
    };//setupTimeline()
    newEncounter.setupVisuals = function()
    {
        var fireDuration = 30000;
        var fireRadius = 5;
        var green = "rgba(0,255,0,0.4)";
        var purple = "rgba(150,0,196,0.4)";
        
        this.setupBlackHoles();
        this.setupTimeline();
        for(var actor of actors)
        {
            if(actor.class.mobID === 94397)//unstable voidfiend
            {
                for(var c of actor.casts.CA)
                {
                    if(spells[c.spellIndex].id === 188939)//volatile voidstep cast
                    {
                        var target = actor.getStateAtTime(c.time + c.castLength + 500);
                        draw.sim.upperVisuals.addStates("Voidstep Target", c.time, c.castLength,
                            generateCircleOnLocation(1.4,"rgb(150,0,196)", target.x, target.y));
                    }
                }
                for(var a of actor.damageDone.AA)
                {
                    if(spells[a.spellIndex].id === 188939)//volatile voidstep hit
                    {
                        draw.timeline.addCast({time:a.time, castLength:0, spellIndex:a.spellIndex});
                        var target = actors[a.target].getStateAtTime(a.time);
                        draw.sim.lowerVisuals.addStates("Voidstep hit - fire", a.time, fireDuration,
                            generateCircleOnLocation(fireRadius, purple, target.x, target.y));
                    }
                }
            }
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 186407)//fel surge
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            var duration = as.endTime - as.time;
                            if(duration < 4500)//try and account for cloak removing
                                continue;
                            draw.sim.upperVisuals.addStates("Fel surge icon", as.time, duration,
                                generateAuraIconOnActor(aura,actor));
                            var loc = actor.getStateAtTime(as.endTime);
                            draw.sim.lowerVisuals.addStates("Fel surge fire",as.endTime, fireDuration,
                                generateCircleOnLocation(fireRadius,green,loc.x, loc.y));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 186333)//void surge
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            var duration = as.endTime - as.time;
                            if(duration < 4500)//try and account for cloak removing
                                continue;
                            draw.sim.upperVisuals.addStates("Void surge icon", as.time, duration,
                                generateAuraIconOnActor(aura,actor));
                            var loc = actor.getStateAtTime(as.endTime);
                            draw.sim.lowerVisuals.addStates("Void surge fire",as.endTime, fireDuration,
                                generateCircleOnLocation(fireRadius,purple,loc.x, loc.y));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 186500)//chains of fel
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Normal Chains", as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura,actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 189777)//emp. chains
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Emp. Chains", as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura,actor));
                            draw.sim.lowerVisuals.addStates("Emp.chains range warning", as.time, as.endTime-as.time,
                                generateCircleOnActor(6,"rgba(255,0,0,0.4)",actor));
                        }
                    }
                }
            }
        }
    };
};

var initMannoroth = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Mannoroth/";
    newEncounter.mobs.push(new EncounterMob("Mannoroth", newEncounter.filePath+"Mannoroth.jpg", true, 0, 91349));
    newEncounter.mobs.push(new EncounterMob("Fel Iron Summoner", newEncounter.filePath+"Summoner.jpg", false, null, 91305));
    newEncounter.mobs.push(new EncounterMob("Demon Portal", null, false, null, 91830));
    newEncounter.mobs.push(new EncounterMob("Doom Lord", newEncounter.filePath+"Doomlord.jpg", false, null, 91241));
    newEncounter.mobs.push(new EncounterMob("Fel Imp", newEncounter.filePath+"Imp.jpg", false, null, 91259));
    newEncounter.mobs.push(new EncounterMob("Dread Infernal", newEncounter.filePath+"Infernal.jpg", false, null, 91270));
    /*newEncounter.mobs.set("Mannoroth",
            new EncounterMob("Mannoroth", newEncounter.filePath+"Mannoroth.jpg", true));
    newEncounter.mobs.set("Fel Imp",
            new EncounterMob("Fel Imp", newEncounter.filePath+"Imp.jpg", false));
    newEncounter.mobs.set("Dread Infernal",
            new EncounterMob("Dread Infernal", newEncounter.filePath+"Infernal.jpg", false));
    newEncounter.mobs.set("Fel Iron Summoner",
            new EncounterMob("Fel Iron Summoner", newEncounter.filePath+"Summoner.jpg", false));
    newEncounter.mobs.set("Demon Portal",
            new EncounterMob("Demon Portal", null, false));*/
    newEncounter.mobsToIgnore = ["Gul'dan"];
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"mannoroth pillars.png", 0.4, 86.2, 2870.4); 


    newEncounter.encounterDescription = "<li><b>Doom Spike</b>: A light purple warning circle is drawn around the target, along with the debuff. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Mark of Doom</b>: Dark purple circles with a icon are drawn on the targets. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Mannoroth's Gaze</b>: Dark blue circles are drawn under the feared players. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Infernal Fire</b>: Small green circles are drawn around the infernals while they are dealing AOE damage. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Wrath of Gul'dan</b>: White stack counts are drawn on the players with the debuff. Red numbers are drawn on people who get hit and gain Gripping Shadows. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Shadowforce</b>: Purple lines are drawn from the boss to the players he is pushing back. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Empowered Mannoroth's Gaze</b>: Everyone who helps soak this gets a white circle drawn under them, this does not scale correctly. Low accuracy</li>"; 

    
    
    /*newEncounter.identifyActor = function(actor)
    {
        if(this.mobs.has(actor.name))
        {
            actor.class = this.mobs.get(actor.name).copy();
        }
        else if(actor.name.startsWith("Doom Lord"))
        {
            actor.class = new EncounterMob("Doom Lord", newEncounter.filePath+"Doomlord.jpg", false, null);
        }
        else
        {
            console.log("Encounter.identifyActor: unable to identify mob type: "+actor.name);
            actor.class = new EncounterMob("Unidentified", "missing", false, null);
        }
    };*/
    
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(91270);//dread infernal
        cd.addDamageWindow(91241);//doomlord
        cd.addDamageWindow(91259);//fel imp
    };
    newEncounter.setupInfernalFire = function()
    {
        var infernals = lookupActorByID(91270);//dread infernal
        for(var inf of infernals)
        {
            var i = 0;
            var startTime = null;
            var possibleEndTime = null;
            var casts = inf.casts.CA;
            
            for(i = 0; i < casts.length; i++)
            {
                if(spells[casts[i].spellIndex].id === 181191)//startFire
                {
                    if(startTime !== null && possibleEndTime !== null)
                    {
                        draw.sim.lowerVisuals.addStates("Infernal Fire", startTime, possibleEndTime,
                            generateCircleOnActor(6,"rgba(0,255,0,0.4)",inf));
                        startTime = possibleEndTime = null;
                    }
                    startTime = casts[i].time;
                }
                if(spells[casts[i].spellIndex].id === 181192)//fire ticks
                {
                    possibleEndTime = casts[i].time +1000;
                }
                else//the jump spell?
                {
                    if(startTime !== null && possibleEndTime !== null)
                    {
                        draw.sim.lowerVisuals.addStates("Infernal Fire", startTime, possibleEndTime,
                            generateCircleOnActor(6,"rgba(0,255,0,0.4)",inf));
                        startTime = possibleEndTime = null;
                    }
                }
            }
            if(startTime !== null && possibleEndTime !== null)
            {
                draw.sim.lowerVisuals.addStates("Infernal Fire", startTime, possibleEndTime,
                    generateCircleOnActor(6,"rgba(0,255,0,0.4)",inf));
                startTime = possibleEndTime = null;
            }
        }
    };
    newEncounter.setupTimeline = function()
    {
        var manno = lookupActorByID(91349)[0];//mannoroth
        var envir = actors[0];//environment
        var demonPortal = lookupActorByID(91830)[0];//demon portal
        this.addPhase(1,"green", manno.states.SA[0].time);
        var phaseCount = 1;
        for(var s of manno.states.SA)
        {
            if(s.curHP/s.maxHP <= 0.65 && phaseCount === 1)
            {
                this.addPhase(2,"yellow", s.time);
                phaseCount++;
            }
            else if(s.curHP/s.maxHP <= 0.35 && phaseCount === 2)
            {
                this.addPhase(3,"red", s.time);
                break;
            }
        }
        var lastShadowforce = 0;
        for(var c of manno.casts.CA)
        {
            if(spells[c.spellIndex].id === 181793 || spells[c.spellIndex].id === 182077 ||//felseeker(1st hit)
                    spells[c.spellIndex].id === 181597||spells[c.spellIndex].id === 182006) //manno's gaze
            {
                if(c.didCastSucceed)
                    draw.timeline.addCast(c);
            }
            else if(spells[c.spellIndex].id === 181841 ||spells[c.spellIndex].id === 182088)//shadowforce
            {
                if(c.time - lastShadowforce > 10000 && c.didCastSucceed)
                {
                    lastShadowforce = c.time;
                    draw.timeline.addCast(c);
                } 
            } 
        }
        for(var c of demonPortal.casts.CA)
        {
            if(spells[c.spellIndex].id === 181275)
                draw.timeline.addCast(c);
        }
        this.addGroupSpawnToTimeline(91259);//fel imp
    }
    newEncounter.setupVisuals = function()
    {
        this.setupInfernalFire();
        this.setupTimeline();
        var manno = lookupActorByID(91349)[0];//mannoroth
        var envir = actors[0];//environment
        
        for(var a of envir.damageDone.AA)
        {
            if(spells[a.spellIndex].id === 182011)//emp fear
            {
                var loc = actors[a.target].getStateAtTime(a.time);
                draw.sim.lowerVisuals.addStates("Fear cloud", a.time, encounterInfo.fightLength,
                    generateCircleOnLocation(15,"rgba(255,255,255,0.4)",loc.x, loc.y));
            }
        }
        for(var actor of actors)
        {
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 189717)//Doom Spike
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Doom Spike Icon", as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura, actor));
                            draw.sim.lowerVisuals.addStates("Doom Spike Circle", as.time, as.endTime-as.time,
                                generateCircleOnActor(20,"rgba(189,52,216,0.3)",actor))
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 181275)//mark of the legion
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("MOTL Icon", as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura,actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 181099)//mark of doom
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Mark of Doom Icon", as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura,actor));
                            draw.sim.lowerVisuals.addStates("Mark of Doom Circle", as.time, as.endTime-as.time,
                                generateCircleOnActor(15,"rgba(80,0,165,0.6)",actor))
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 181841 || spells[aura.spellIndex].id === 182088)//emp/reg shadowforce
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Shadowforce Line", as.time, as.endTime-as.time,
                                generateLineBetweenActors(manno, actor, "rgb(80,0,165)", 2));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 182006 || spells[aura.spellIndex].id === 181597)//emp/reg manno's gaze(fear)
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Manno's Gaze Icon", as.time, as.endTime-as.time,
                                generateAuraIconOnActor(aura,actor));
                            draw.sim.lowerVisuals.addStates("Manno's Gaze Circle", as.time, as.endTime-as.time,
                                generateCircleOnActor(6,"rgba(0,0,200,0.6)",actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 186362)//wrath of gul'dan
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("WOGD Icon", as.time, as.endTime-as.time,
                                generateAuraIconWithStacksOnActor(aura,actor, "rgb(255,255,255)", true));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 190482)//gripping shadows
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Gripping Shadows Icon", as.time, as.endTime-as.time,
                                generateStackCountOnActor(aura,actor, "rgb(255,55,55)"));
                        }
                    }
                }
            }
        }
    };
};

var initArchimonde = function(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/HFC/Archimonde/";
    newEncounter.mobs.push(new EncounterMob("Archimonde", newEncounter.filePath+"Archimonde.jpg", true, 0, 91331));
    newEncounter.mobs.push(new EncounterMob("Hellfire Deathcaller", newEncounter.filePath+"Doomlord.jpg", false, null, 92740));
    newEncounter.mobs.push(new EncounterMob("Shackled Soul", null, false, null, 93382));
    newEncounter.mobs.push(new EncounterMob("Dreadstalker", newEncounter.filePath+"Felhunter.jpg", false, null, 93616));
    newEncounter.mobs.push(new EncounterMob("Felborne Overfiend", newEncounter.filePath+"Overfiend.jpg", false, null, 93615));
    newEncounter.mobs.push(new EncounterMob("Source of Chaos", newEncounter.filePath+"Crystal.jpg", false, null, 96119));
    newEncounter.mobs.push(new EncounterMob("Infernal Doombringer", newEncounter.filePath+"Infernal.jpg", false, null, 94412));
    newEncounter.mobs.push(new EncounterMob("Void Star", newEncounter.filePath+"Voidstar.jpg", false, null, 95775));
    newEncounter.mobs.push(new EncounterMob("Doomfire Spirit", newEncounter.filePath+"Doomfire.jpg", false, null, 92208));
    newEncounter.mobs.push(new EncounterMob("Desecration", newEncounter.filePath+"FelCrystal.jpg", false, null, 92781));
    newEncounter.mobs.push(new EncounterMob("Living Shadow", newEncounter.filePath+"Shadow.jpg", false, null, 93297));
    newEncounter.mobs.push(new EncounterMob("Shadowed Netherwalker", newEncounter.filePath+"Voidwalker.jpg", false, null, 94695));
    newEncounter.mobs.push(new EncounterMob("Shadow Storm", null, false, null, 94232));
    newEncounter.mobs.push(new EncounterMob("Dark Conduit", newEncounter.filePath+"Conduit.jpg", false, null, 95989));
    /*newEncounter.mobs.set("Archimonde",
            new EncounterMob("Archimonde", newEncounter.filePath+"Archimonde.jpg", true, 0));
    newEncounter.mobs.set("Hellfire Deathcaller",
            new EncounterMob("Hellfire Deathcaller", newEncounter.filePath+"Doomlord.jpg", false));
    newEncounter.mobs.set("Shackled Soul",
            new EncounterMob("Shackled Soul", null, false));
    newEncounter.mobs.set("Dreadstalker",
            new EncounterMob("Dreadstalker", newEncounter.filePath+"Felhunter.jpg", false));
    newEncounter.mobs.set("Felborne Overfiend",
            new EncounterMob("Felborne Overfiend", newEncounter.filePath+"Overfiend.jpg", false));
    newEncounter.mobs.set("Source of Chaos",
            new EncounterMob("Source of Chaos", newEncounter.filePath+"Crystal.jpg", false));
    newEncounter.mobs.set("Infernal Doombringer",
            new EncounterMob("Infernal Doombringer", newEncounter.filePath+"Infernal.jpg", false));
    newEncounter.mobs.set("Void Star",
            new EncounterMob("Void Star", newEncounter.filePath+"Voidstar.jpg", false));
    newEncounter.mobs.set("Doomfire Spirit",
            new EncounterMob("Doomfire Spirit", newEncounter.filePath+"Doomfire.jpg", false));
    newEncounter.mobs.set("Desecration",
            new EncounterMob("Desecration", newEncounter.filePath+"FelCrystal.jpg", false));
    newEncounter.mobs.set("Living Shadow",
            new EncounterMob("Living Shadow", newEncounter.filePath+"Shadow.jpg", false));
    newEncounter.mobs.set("Shadowed Netherwalker",
            new EncounterMob("Shadowed Netherwalker", newEncounter.filePath+"Voidwalker.jpg", false));
    newEncounter.mobs.set("Shadow Storm",//no idea, only on heroic
            new EncounterMob("Shadow Storm", null, false));
    newEncounter.mobs.set("Dark Conduit",
            new EncounterMob("Dark Conduit", newEncounter.filePath+"Conduit.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"archi.png", 0.56, 1913, -4258);


    newEncounter.encounterDescription = "<li><b>Doomfire Fixate</b>: A green line is drawn from the doomfire spirit to the player it's fixated on. High accuracy.</li>"; 
    newEncounter.encounterDescription += "<li><b>Doomfire DOT</b>: Players who stand in doomfire have the debuff icon drawn on them, with the stack count in white text. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Doomfire on the ground</b>: On heroic, green circles will be placed wherever a stack of doomfire is gained, on Mythic they will drop when the debuff does. Circles last a set amount of time. Low accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Shadowfel Burst</b>: Purple circles get drawn under the players knocked into the air. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Wrought and Focused Chaos</b>: A line combining the class colors of the targets is drawn where the explosion will hit. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Shackled Torment</b>: A light purple circle is drawn showing the mythic explosion size. A purple line is drawn from the chained player to the center of their circle and the distance is written in light purple text. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Consume Magic</b>: Purple circles are drawn under the Dreadstalker as they cast their AOE. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Dark Conduit</b>: Purple circles are drawn warning where the conduits are about to appear. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Mark of the Legion</b>: Debuff icons are drawn on the players, showing how long until the explosion occurs. High accuracy</li>"; 
    newEncounter.encounterDescription += "<li><b>Void Star</b>: A purple line is drawn from the star to the player it is chasing. High accuracy</li>"; 

    
    newEncounter.setupTimeline = function()
    {
        var archi = lookupActorByID(91331)[0];//archi
        this.addPhase(1, "green", 0);
        var phaseCount = 1;
        for(var s of archi.states.SA)
        {
            if(s.curHP/s.maxHP <= 0.705 && phaseCount === 1)
            {
                var des = lookupActorByID(92781);//desicration
                for(var d of des)
                {   
                    d.states.SA[d.states.SA.length-1].time = s.time;
                }
                
                this.addPhase(2,"yellow", s.time);
                phaseCount++;
                //detecting mythinc p3 based on Nether Ascention cast
                if(this.isMythic())
                    break;
            }
            else if(s.curHP/s.maxHP <= 0.405 && phaseCount === 2)
            {
                this.addPhase(3, "red", s.time);
                break;
            }
        }
        var lastConduit = 0;
        for(var c of archi.casts.CA)
        {
            if(!newEncounter.isMythic())
            {
                if(spells[c.spellIndex].id === 183254)//allure
                {
                    draw.timeline.addCast(c);
                }
            }
            else
            {
                if(spells[c.spellIndex].id === 190313)//netherAscention(p3)
                {
                    this.addPhase(3, "red", c.time+c.castLength);
                }
            }
            if(spells[c.spellIndex].id === 184931 || spells[c.spellIndex].id === 190506 ||//shackles, seething corruption(dance)
                    spells[c.spellIndex].id === 183817 || spells[c.spellIndex].id === 189897 ||//burst, doomfire spirit
                    spells[c.spellIndex].id === 184265 || spells[c.spellIndex].id === 188514)//wrough chaos, MOTL
            {
                draw.timeline.addCast(c);
            }
            else if(spells[c.spellIndex].id === 190394 )//dark conduit
            {
                if(c.time-lastConduit > 8000)
                {
                    draw.timeline.addCast(c);
                    lastConduit = c.time;
                }
            }
        }
        
        this.addGroupSpawnToTimeline(93616);//dreadstalker
        this.addGroupSpawnToTimeline(94412);//infernal doombringer
    };
    
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(92208);//doomfire spirit
        cd.addDamageWindow(92740);//hellfire deathcaller
        cd.addDamageWindow(93616);//dreadstalker
        cd.addDamageWindow(94412,20000);//infernal doombringer
        cd.addDamageWindow(95775);//voidstar
        cd.addDamageWindow(96119);//source of chaos
    };
    
    newEncounter.setupVisuals = function()
    {
        var conduits = lookupActorByID(95989);//dark conduit
        for(var c of conduits)
        {
            if(c.states.SA.length >= 2)
            {
                draw.sim.lowerVisuals.addStates("conduit warning", c.states.SA[0].time-2000, 2000,
                    generateCircleOnLocation(8, "rgba(150,0,196,0.4)", c.states.SA[0].x, c.states.SA[0].y));
                var last = c.states.SA[c.states.SA.length-1];
                if(last.time === c.states.SA[0].time)
                {
                    last.time = this.fightLength;
                }
            }
        }
        this.setupTimeline();
        var archi = lookupActorByID(91331)[0];//archimonde
        var doomfireSpirits = lookupActorByID(92208);//doomfire spirits
        for(var actor of actors)
        {
            if(actor.class.mobID === 93616)//dreadstalker
            {
                for(var c of actor.casts.CA)
                {
                    if(spells[c.spellIndex].id === 186562)//consume magic
                    {
                        draw.sim.lowerVisuals.addStates("consume magic", c.time, c.castLength,
                            generateCircleOnActor(5,"rgba(150,0,196,0.4)",actor));
                    }
                }
            }
            for(var aura of actor.auras.AM)
            {
                aura = aura[1];
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 182879)//doomfire fixate
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            if(Array.isArray(doomfireSpirits))
                            {
                                for(var ds of doomfireSpirits)
                                {
                                    if(!(ds.getStateAtTime(as.time) instanceof Death))
                                    {
                                        draw.sim.lowerVisuals.addStates("Doomfire Fixate", as.time, as.endTime-as.time,
                                            generateLineBetweenActors(ds,actor,"rgba(0,255,0,0.4)",2));
                                        break;
                                    }//was the spirit alive
                                }//for the array elements
                            }//if an array
                            else
                            {
                                draw.sim.lowerVisuals.addStates("Doomfire Fixate", as.time, as.endTime-as.time,
                                    generateLineBetweenActors(doomfireSpirits,actor,"rgba(0,255,0,0.4)",2));
                            }//else not an array
                        }//if stateApplied
                    }//for aura staes
                }//if doomfire fixate
                else if(spells[aura.spellIndex].id === 183634)//Shadowfel Burst(knockup)
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Shadowfel Burst", as.time, as.endTime-as.time,
                                generateCircleOnActor(5,"rgba(150,0,196,0.4)",actor));
                        }//for state applied
                    }//for aura states
                }//else if Shadowfel Burst
               else if(spells[aura.spellIndex].id === 190806 || spells[aura.spellIndex].id === 190807 ||
                        spells[aura.spellIndex].id === 190808)//void star fixates
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("void star fixate", as.time, as.endTime-as.time,
                                generateLineBetweenActors(actor, actors[aura.source],"rgb(150,0,196)", 3));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 183586)//doomfire
                {
                    if(newEncounter.isMythic())
                    {
                        var stackCount = 1;//track the stack count as it updates, so the final pool can match
                        for(var as of aura.AA)
                        {
                            if(as instanceof aura.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("Doomfire Icon", as.time, as.endTime - as.time,
                                    generateAuraIconWithStacksOnActor(aura,actor,"rgb(175,255,178)"));
                            }
                            else if(as instanceof aura.stateStack)
                            {
                                stackCount = as.stackCount;
                            }
                            else if(as instanceof aura.stateRemoved)
                            {
                                var loc = actor.getStateAtTime(as.time);
                                var fireDuration = 57000;
                                //make sure the doomfire doesnt show up in p3
                                if(this.phases[2])
                                {
                                    //debuff drops in p3, ignore
                                    if(this.phases[2].time < as.time)
                                        continue;
                                    //remove existing pools early
                                    if(as.time + fireDuration > this.phases[2].time)
                                        fireDuration = this.phases[2].time - as.time;
                                }
                                draw.sim.lowerVisuals.addStates("Doomfire Drops", as.time, fireDuration,
                                    generateCircleOnLocation(0.9*stackCount, "rgba(0,255,0,0.4)", loc.x, loc.y));
                                stackCount = 1;
                            }
                        }//for auraStates
                    }//if Mythic
                    else
                    {
                        for(as of aura.AA)
                        {
                            if(as instanceof aura.stateApplied)
                            {
                                var loc = actor.getStateAtTime(as.time);
                                draw.sim.lowerVisuals.addStates("Doomfire Location", as.time, 57000,
                                    generateCircleOnLocation(6, "rgba(0,255,0,0.4)", loc.x, loc.y));
                                draw.sim.upperVisuals.addStates("Doomfire Icon", as.time, as.endTime - as.time,
                                    generateAuraIconWithStacksOnActor(aura,actor,"rgb(175,255,178)"));
                            }//if state applied
                            else if(as instanceof aura.stateStack)
                            {
                                draw.sim.lowerVisuals.addStates("Doomfire Location", as.time, 57000,
                                    generateCircleOnLocation(6, "rgba(0,255,0,0.4)", loc.x, loc.y));
                            }
                        }//for aura states
                    }//if lfr/norm/heroic
                }//else if doomfire
                else if(spells[aura.spellIndex].id === 185014)//focused Chaos
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Chaos Vector", as.time, as.endTime-as.time,
                                generateVectorBetweenActors(actors[aura.source],actor));
                        }
                    }
                }//else if focused chaos
                else if(spells[aura.spellIndex].id === 184964)//shackled torment
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            var loc = actor.getStateAtTime(as.time);
                            draw.sim.lowerVisuals.addStates("Shackled Circle", as.time, as.endTime - as.time,
                                generateCircleOnLocation(25,"rgba(150,0,196,0.2)", loc.x, loc.y));
                            draw.sim.lowerVisuals.addStates("Shackled Line", as.time, as.endTime-as.time,
                                generateLineBetweenActorAndPoint(actor,loc.x,loc.y,"rgba(255,0,0,0.6)",2));
                            draw.sim.upperVisuals.addStates("Shackle Dist", as.time, as.endTime-as.time,
                                generateDistanceFromPoint(actor, loc.x, loc.y, "rgb(255,201,238)"));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 187050)//mark of the legion
                {
                    for(var as of aura.AA)
                    {
                        if(as instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("MOTL icon", as.time, as.endTime - as.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }
            }//for auras
        }//for guids
    };//setupVisuals()
};