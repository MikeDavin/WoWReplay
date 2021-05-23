function initGoroth(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/Goroth/";

    //newEncounter.mobs.push(new EncounterMob("", newEncounter.filePath+".jpg", false, null, ));
    newEncounter.mobs.push(new EncounterMob("Goroth", newEncounter.filePath+"goroth.jpg", true, 0, 115844));
    newEncounter.mobs.push(new EncounterMob("Brimstone Infernal", newEncounter.filePath+"infernal.jpg", false, null, 119950));
    /*newEncounter.mobs.set("Goroth",
        new EncounterMob("Goroth", newEncounter.filePath+"goroth.jpg", true, 0));
    newEncounter.mobs.set("Brimstone Infernal",
        new EncounterMob("Brimstone Infernal", newEncounter.filePath+"infernal.jpg", false));*/

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"tomb1.png",1.037,327,-6498);
    newEncounter.setupVisuals = function()
    {
        var spike = new Image();
        spike.src = newEncounter.filePath+"spike.jpg";

        this.addPhase(1, "green", 0);
        var goroth = lookupActorByID(115844)[0];//Goroth
        if(!goroth)
        {
            return;
        }
        for(var ci = 0; ci < goroth.casts.CA.length; ci++)
        {
            var cast = goroth.casts.CA[ci];
            if(spells[cast.spellIndex].id === 233062)//infernal burning
            {
                draw.timeline.addCast(cast);
                this.addPhase(2, "yellow", cast.time);
                this.addPhase(1, "green", cast.time + cast.castLength);
            }
            else if(spells[cast.spellIndex].id === 233272)//shattering star
            {
                draw.timeline.addCast(cast);
                var target = actors[cast.target];
                draw.sim.upperVisuals.addStates("shattering star line", cast.time, 6000,
                    generateLineBetweenActors(goroth, target, "rgba(0,255,0,0.5", 5));
            }
        }
        for(var di = 0; di < goroth.damageDone.AA.length; di++)
        {
            var dmg = goroth.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 238588)//rain of brimstone
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                if(loc)
                    draw.sim.lowerVisuals.addStates("rain of brimstone loc", dmg.time-7000, 7000,
                        generateCircleOnLocation(5, "rgba(145, 0, 0, 0.4", loc.x, loc.y));
            }
        }
        var infernals = lookupActorByID(119950);
        for(var ii = 0; ii < infernals.length; ii++)
        {
            var infernal = infernals[ii];
            if(infernal.states.SA.length === 0)
                continue;
            draw.sim.lowerVisuals.addStates("rain of brimstone loc", infernal.states.SA[0] .time-7000, 7000,
                        generateCircleOnLocation(5, "rgba(145, 0, 0, 0.4", infernal.states.SA[0].x, infernal.states.SA[0].y));
        }
        var envir = actors[0];
        for(var di = 0; di < envir.damageDone.AA.length; di++)
        {
            var dmg = envir.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 230348)//fel pool
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                draw.sim.lowerVisuals.addStates("Fel Pool", dmg.time, 15000,
                    generateCircleOnLocation(3, "rgb(0,255,0)", loc.x, loc.y));
            }
            else if(spells[dmg.spellIndex].id === 233021)//infernal spike
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                draw.sim.lowerVisuals.addStates("Spike", dmg.time, 15000,
                    generateIconOnLocation(spike, loc.x, loc.y, null, null, 2));
            }
        }
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 230345)//crashing comet
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Crashing Comet Dot", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                            draw.sim.lowerVisuals.addStates("Crashing Comet Range", auraState.time-4000, 4000,
                                generateCircleOnActor(10, "rgba(255,0,0,0.5)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 231363)//burning armor
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var range = 10;
                            if(newEncounter.isHeroic())
                                range = 20;
                            if(newEncounter.isMythic())
                                range = 25;

                            draw.sim.upperVisuals.addStates("Burning Armor Dot", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("Burning Armor Range", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(range, "rgba(255,0,0,0.5)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 233062)//infernal burning, did not dodge explosion
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Infernal Burning failed dodge", auraState.time-6000, 6000,
                                generateLineBetweenActors(actor, goroth, "rgba(255,0,0,0.5)", 3, null, null, true));
                            draw.sim.actorVisuals.addStates("Infernal Burning Dot", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                        }
                    }
                }
            });//foreach aura
        }//for actors
    };//setupVisuals()
};//initGoroth()

function initDemonicInquisition(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/DemonicInquisition/";

    newEncounter.mobs.push(new EncounterMob("Atrigan", newEncounter.filePath+"brown hood.jpg", true, 0, 116689));
    newEncounter.mobs.push(new EncounterMob("Belac", newEncounter.filePath+"green horns.jpg", true, 0, 116691));
    newEncounter.mobs.push(new EncounterMob("Tormented Soul", newEncounter.filePath+"shadow.jpg", false, null, 117957));
    newEncounter.mobs.push(new EncounterMob("Tormented Fragment", newEncounter.filePath+"shadow.jpg", false, null, 121138));

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"tomb1.png",0.992,345,-6511);

    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(121138);//tormented fragment
    };
    newEncounter.setupVisuals = function()
    {
        draw.sim.lowerVisuals.addStates("add cage", 0, Number.MAX_VALUE,
            generateCircleOnLocation(22, "rgb(91, 91, 91)", 934.35, -6404.36));

        var atrigan = lookupActorByID(116689)[0];//atrigan
        var belac = lookupActorByID(116691)[0];//belac
        var tormentedSoul = lookupActorByID(117957)[0];//tormented soul
        var envir = actors[0];
        if(tormentedSoul)
            removeDowntime(tormentedSoul, 2000);
        if(!atrigan || !belac)
            return;
        
        for(var ci = 0; ci < belac.casts.CA.length; ci++)
        {
            var cast = belac.casts.CA[ci];
            if(spells[cast.spellIndex].id === 235230)//fel squall
            {
                draw.timeline.addCast(cast);
            }
            else if(spells[cast.spellIndex].id === 239401 && cast.didCastSucceed)//pangs of guilt(interruptible raidwide nuke)
            {
                draw.timeline.addCast(cast);
            }
        }
        for(var ci = 0; ci < atrigan.casts.CA.length; ci++)
        {
            var cast = atrigan.casts.CA[ci];
            if(spells[cast.spellIndex].id === 233441)//bone saw
            {
                draw.timeline.addCast(cast);
            }
        }
        for(var di = 0; di < atrigan.damageDone.AA.length; di++)
        {
            var dmg = atrigan.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 233426)//scythe Sweep(tank cone)
            {
                draw.sim.lowerVisuals.addStates("scythe sweep cone", dmg.time, 1000,
                    generateConeBetweenActors(atrigan, actors[dmg.target], Math.PI/4, 20,"rgb(150,0,0)"));
            }
        }
        for(var di = 0; di < envir.damageDone.AA.length; di++)
        {
            var dmg = envir.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 233901)//suffocating dark(voidzones)
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                draw.sim.lowerVisuals.addStates("Suffocating Dark Location", dmg.time, 5000,
                    generateCircleOnLocation(4, "rgb(75,0,110)", loc.x, loc.y));
            }
        }

        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 235230)//Fel Squall
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Fel Squall Range", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(6, "rgb(0,255,0)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 233441)//Bone Saw
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Bone Saw Range", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(6, "rgb(150,0,0)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 236283)//Belac's Prisoner(inside the cage)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateRemoved)
                        {
                            actor.miscEvents.insertAltPowerReset(auraState.time);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 233431)//calcified quills(warning debuff)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("calcified quills warning", auraState.time, auraState.endTime-auraState.time,
                                generateConeBetweenActors(atrigan, actor, Math.PI/12, 80,"rgba(150,0,0, 0.4)"));
                        }
                        else if(auraState instanceof a.stateRemoved)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            var atLoc = atrigan.getStateAtTime(auraState.time);
                            var dir = getAngleBetweenPoints(atLoc.x, atLoc.y, loc.x, loc.y);
                            if(loc && atLoc)
                            {
                                draw.sim.lowerVisuals.addStates("calcified quills hit", auraState.time, 1000,
                                    generateConeOnActor(atrigan, dir, Math.PI/12, 80,"rgb(150,0,0)"));
                            }
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 233430)//unberable torment(full torment)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("unberable torment icon", auraState.time, auraState.endTime- auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 233983)//echoing anguish(dispell dot)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("echoing anguish icon", auraState.time, auraState.endTime- auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                            draw.sim.lowerVisuals.addStates("echoing anguish range", auraState.time, auraState.endTime- auraState.time,
                                generateCircleOnActor(8, "rgba(81, 0, 135, 0.6)", actor));
                        }
                    }
                }
            });//forAuras
            if(actor.class instanceof PlayerClass)
            {
                for(var si = 0; si < actor.states.SA.length; si++)
                {
                    var state = actor.states.SA[si];
                    if(state instanceof Death)
                        actor.miscEvents.insertAltPowerReset(state.time);
                }
                actor.addAltPowerToRes();
                draw.sim.actorVisuals.addStates("Torment count", 0, Number.MAX_VALUE,
                    generateResCountOnActor(actor, 10), actor);
            }
        }//for actors
    };//setupVisuals()
};//initDemonicInquisition()

function initHarjatan(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/Harjatan/";

    newEncounter.mobs.push(new EncounterMob("Harjatan", newEncounter.filePath+"harjatan.jpg", true, 0, 116407));
    newEncounter.mobs.push(new EncounterMob("Razorjaw Gladiator", newEncounter.filePath+"gladiator.jpg", false, null, 117596));
    newEncounter.mobs.push(new EncounterMob("Razorjaw Wavemender", newEncounter.filePath+"white murloc.jpg", false, null, 116569));
    newEncounter.mobs.push(new EncounterMob("Incubated Egg", newEncounter.filePath+"red egg.jpg", false, null, 120545));
    newEncounter.mobs.push(new EncounterMob("Colicky Tadpole", newEncounter.filePath+"colicky tadpole.jpg", false, null, 121156));
    newEncounter.mobs.push(new EncounterMob("Sickly Tadpole", newEncounter.filePath+"sickly tadpole.jpg", false, null, 121155));
    newEncounter.mobs.push(new EncounterMob("Drippy Tadpole", newEncounter.filePath+"baby murloc.jpg", false, null, 120574));

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"tomb2.png",0.685,608,-6224);
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(117596, 20000);//gladiators 
        cd.addDamageWindow(116569, 20000);//wavemender
        cd.addDamageWindow(120545, 30000); //incubated egg
        cd.addDamageWindow(121156);//colicky
        cd.addDamageWindow(121155, 20000);//sickly
        cd.addDamageWindow(120574);//drippy
    };
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1,"green", 0);
        this.addGroupSpawnToTimeline(116569);//wavemender
        this.addGroupSpawnToTimeline(121156);//colicky tadpole
        this.addGroupSpawnToTimeline(120574);//drippy tadpole
        this.addGroupSpawnToTimeline(121155);//sickly
        var thisEncounter = this;
        var drawInEndTime = [];
        var voidzones = [];
        var updateDrawIn = function(newTime)
        {
            for(var di = 0; di < drawInEndTime.length; di++)
            {
                if(Math.abs(drawInEndTime[di]-newTime) < 60000)
                {
                    if(drawInEndTime[di] < newTime)
                        drawInEndTime[di] = newTime;
                    return;
                }
            }
            drawInEndTime.push(newTime);
        };

        var envir = actors[0];
        for(var di = 0; di < envir.damageDone.AA.length; di++)
        {
            var dmg = envir.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 231768)//drenching waters
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                if(loc)
                    voidzones.push({time:dmg.time, x:loc.x, y:loc.y, size:"small"});
            }
        }

        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.name === "Harjatan")
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 231854)//unchecked rage
                    {
                        var target = actor.getTargetAtTime(cast.time);
                        if(target)
                            draw.sim.lowerVisuals.addStates("Unchecked Rage Cone", cast.time+cast.castLength, 1000,
                                generateConeBetweenActors(actor, actors[target], Math.PI/3, 20, "rgb(255,0,0)"));
                    }
                }
            }
            else if(actor.name === "Razorjaw Gladiator")
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 234129 && cast.target)//splashy cleave
                    {
                        draw.sim.lowerVisuals.addStates("Splashy Cleave Cone", cast.time+cast.castLength, 1000,
                            generateConeBetweenActors(actor, actors[cast.target], Math.PI/2, 8, "rgb(0,0,210)"));
                    }
                }
            }
            else if(actor.name === "Drippy Tadpole") //this doesnt seem accurate
            {
                if(actor.states.SA.length !== 0)
                {
                    var poolTime = actor.states.SA[0].time+6000;
                    var endTime = actor.states.SA[actor.states.SA.length-1].time;
                    while(poolTime < endTime)
                    {
                        var loc = actor.getStateAtTime(poolTime);
                        if(loc)
                            voidzones.push({time:poolTime, x:loc.x, y:loc.y, size:'big'});
                        poolTime+=6000;
                    }
                }
            }
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 234016)//Driven Assault(glad fixate)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Driven Assault Line", auraState.time, auraState.endTime-auraState.time,
                                generateLineBetweenActors(actor, actors[a.source], "rgb(255,0,0)", 1, null, null, true));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 241600)//sickly fixate(tadpole fixate)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Sickly Fixate Line", auraState.time, auraState.endTime-auraState.time,
                                generateLineBetweenActors(actor, actors[a.source], "rgb(0,200,0)", 1, null, null, true));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 233429)//Frigid Blows(p2 boss buff)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var prevStack = 0;
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            thisEncounter.addPhase(2, "blue", auraState.time);
                            draw.sim.actorVisuals.addStates("Frigid Blows Count", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor), actor);
                            prevStack = 1;
                            updateDrawIn(auraState.time);
                        }
                        else if(auraState instanceof a.stateRemoved)
                        {
                            thisEncounter.addPhase(1, "green", auraState.time);
                        }
                        else if(auraState instanceof a.stateStack)
                        {
                            if(auraState.stack > prevStack)
                                updateDrawIn(auraState.time);
                            prevStack = auraState.stack;
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 231770)//Drenched
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Drenched Stacks", auraState.time, auraState.endTime-auraState.time,
                                generateStackCountOnActor(a, actor, "rgb(255, 255, 255)"),actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 231998)//Jagged Abrasion(tank bleed)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Jagged Abrasion Stacks", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255, 255, 255)"),actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 231729)//Aqueous Burst
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var loc = actor.getStateAtTime(auraState.endTime);
                            draw.sim.upperVisuals.addStates("Aqueous Burst Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("Aqueous Burst Warning", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(6,"rgba(2,221,255,0.4)", actor));
                            if(loc)
                                voidzones.push({time:auraState.endTime, x:loc.x, y:loc.y, size:"big"});
                        }
                    }
                }
            });//foreach aura
        }//for actors
        drawInEndTime.push(Number.MAX_VALUE);
        var dii = 0;
        voidzones.sort(function(a,b){return a.time-b.time;});
        for(var vi = 0; vi < voidzones.length; vi++)
        {
            var vs = voidzones[vi];
            if(drawInEndTime[dii] < vs.time)
                dii++;
            var radius = (vs.size === "big")?4:1;
            draw.sim.lowerVisuals.addStates("Drenching Waters Voidzone", vs.time, drawInEndTime[dii]-vs.time,
                generateCircleOnLocation(radius, "rgb(2,221,255)", vs.x, vs.y));
        }
    };//setupVisuals()
};//initHarjatan()

function initSasszine(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/Sasszine/";

    newEncounter.mobs.push(new EncounterMob("Mistress Sassz'ine", newEncounter.filePath+"sasszine.jpg", true, 0, 115767));
    newEncounter.mobs.push(new EncounterMob("Electrifying Jellyfish", newEncounter.filePath+"jellyfish.jpg", false, null, 115896));
    newEncounter.mobs.push(new EncounterMob("Abyss Stalker", newEncounter.filePath+"eel.jpg", false, null, 115795));
    newEncounter.mobs.push(new EncounterMob("Razorjaw Waverunner", newEncounter.filePath+"murloc.jpg", false, null, 115902));
    newEncounter.mobs.push(new EncounterMob("Piranhado", newEncounter.filePath+"tornado.jpg", false, null, 116841));
    newEncounter.mobs.push(new EncounterMob("Sarukel", newEncounter.filePath+"whale.jpg", false, null, 116843));
    newEncounter.mobs.push(new EncounterMob("Delicious Bufferfish", newEncounter.filePath+"fish.jpg", false, null, 119791));
    /*newEncounter.mobs.set("Mistress Sassz'ine",
        new EncounterMob("Mistress Sassz'ine", newEncounter.filePath+"sasszine.jpg", true, 0));
    newEncounter.mobs.set("Electrifying Jellyfish",
        new EncounterMob("Electrifying Jellyfish", newEncounter.filePath+"jellyfish.jpg", false));
    newEncounter.mobs.set("Abyss Stalker",
        new EncounterMob("Abyss Stalker", newEncounter.filePath+"eel.jpg", false));
    newEncounter.mobs.set("Razorjaw Waverunner",
        new EncounterMob("Razorjaw Waverunner", newEncounter.filePath+"murloc.jpg", false));
    newEncounter.mobs.set("Piranhado",
        new EncounterMob("Piranhado", newEncounter.filePath+"tornado.jpg", false));
    newEncounter.mobs.set("Sarukel",
        new EncounterMob("Sarukel", newEncounter.filePath+"whale.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"tomb3.png",.251,1113,-5890);
    newEncounter.setupVisuals = function()
    {
        var sassy = lookupActorByID(115767);//sasszine
        if(sassy.length === 0)
            return;
        
        for(var si = 1; si < sassy.length; si++)
            sassy[si].class.isImportant = false;
        sassy = sassy[0];

        var fishEvents = [];
        var sharkAttacks = [];
        var sharkBites = [];
        var burdenZaps = [];
        var devouringMaws = [];
        var partialInks = [];
        var sarukelFound = false;
        var sharkAttackDelay = 6000;


        this.addPhase(1, "green", 0);
        var murlocs = lookupActorByID(115902);
        for(var mi = 0; mi < murlocs.length; mi++)
        {
            removeDowntime(murlocs[mi]);
        }
        var phaseCount = 1;

        for(var si = 0; si < sassy.states.SA.length; si++)
        {
            var state = sassy.states.SA[si];
            if(state instanceof Death)
                continue;

            if(this.isMythic())
            {
                var sharkIcon = new Image();
                sharkIcon.src = this.filePath+"shark.jpg";
                if( (state.curHP/state.maxHP <= 0.85 && sharkAttacks.length === 0) ||
                    (state.curHP/state.maxHP <= 0.70 && sharkAttacks.length === 1) ||
                    (state.curHP/state.maxHP <= 0.55 && sharkAttacks.length === 2) ||
                    (state.curHP/state.maxHP <= 0.40 && sharkAttacks.length === 3) ||
                    (state.curHP/state.maxHP <= 0.25 && sharkAttacks.length === 4) ||
                    (state.curHP/state.maxHP <= 0.10 && sharkAttacks.length === 5))
                {
                    draw.timeline.addIcon(state.time+sharkAttackDelay, sharkIcon);
                    sharkAttacks.push(state.time+sharkAttackDelay);
                }
            }


            if(state.curHP/state.maxHP <= 0.7 && phaseCount === 1)
            {
                this.addPhase(2, "yellow", state.time);
                phaseCount++;
            }
            else if(state.curHP/state.maxHP <= 0.4 && phaseCount === 2)
            {
                this.addPhase(3, "red", state.time);
                phaseCount++;
            }
        }
        for(var ci = 0; ci < sassy.casts.CA.length; ci++)
        {
            var cast = sassy.casts.CA[ci];
            if(spells[cast.spellIndex].id === 232757 || spells[cast.spellIndex].id === 232722 ||//call veluius, slicing tornado
                spells[cast.spellIndex].id === 232746)//becon saurkel
            {
                draw.timeline.addCast(cast);
            }
        }
        var eels = lookupActorByID(115795);//abyss stalker
        for(var eeli = 0; eeli < eels.length; eeli++)
        {
            eel = eels[eeli];
            if(eel.states.SA.length === 0)
                continue;

            var bigDuration = (this.isMythic())?6000:15000;
            var smallDuration = (this.isMythic())?20000:5000;
            var finalState = eel.states.SA[eel.states.SA.length-1];
            draw.sim.lowerVisuals.addStates("Big Concealing Muk", finalState.time, bigDuration,
                generateCircleOnLocation(5, "rgb(50,50,50)", finalState.x, finalState.y));
            draw.sim.lowerVisuals.addStates("Small Concealing Muk", finalState.time+bigDuration, smallDuration,
                generateCircleOnLocation(2, "rgb(50,50,50)", finalState.x, finalState.y));
        }
        var jellys = lookupActorByID(115896);//electrifying jellyfish
        for(var ji = 0; ji < jellys.length; ji++)
        {
            var jelly = jellys[ji];
            for(var ci = 0; ci < jelly.casts.CA.length; ci++)
            {
                var cast = jelly.casts.CA[ci];
                if(spells[cast.spellIndex].id === 230362)//thundering shock
                {
                    draw.timeline.addCast(cast);
                    var loc = jelly.getStateAtTime(cast.time);
                    draw.sim.lowerVisuals.addStates("Thundering Shock Warning", cast.time,3500,
                        generateCircleOnLocation(8, "rgba(0,178,255,0.4)",loc.x, loc.y));
                }
            }
        }
        var sharks = lookupActorByID(116841);//piranhado
        for(var sharki = 0; sharki < sharks.length; sharki++)
        {
            var shark = sharks[sharki];
            for(var ci = 0; ci < shark.casts.CA.length; ci++)
            {
                var cast = shark.casts.CA[ci];
                if(spells[cast.spellIndex].id === 232827)//crashing wave
                {
                    var loc = shark.getStateAtTime(cast.time);
                    var dx = 1247.3-loc.x;
                    var dy = -5800.75-loc.y;
                    draw.sim.lowerVisuals.addStates("Crashing Wave", cast.time,5000-(this.isMythic()?1000:0),
                        generateLineBetweenPoints(loc.x, loc.y, loc.x+(2*dx), loc.y+(2*dy), "rgba(0,178,255,0.4)",35));
                }
            }
        }

        for(var ai = 0; ai < actors.length; ai++)
        {
            actor = actors[ai];
            if(actor.class instanceof PlayerClass || actor.class.mobID === 119791)//delicious bufferfish
            {
                for(var di = 0; di < actor.damageDone.AA.length; di++)
                {
                    var dmg = actor.damageDone.AA[di];
                    if(spells[dmg.spellIndex].id === 239436)//dread shark
                    {
                        sharkBites.push({src:actor, target:actors[dmg.target], time: dmg.time});
                    }
                    else if(spells[dmg.spellIndex].id === 234747 || spells[dmg.spellIndex].id === 230214)//burden of pains
                    {
                        burdenZaps.push({src:actor, target:actors[dmg.target], time:dmg.time});
                    }
                }
            }
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 230139)//Hydra Shot
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Hydra Shot Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                            draw.sim.upperVisuals.addStates("Hydra Shot Line", auraState.time, auraState.endTime-auraState.time,
                                generateLineBetweenActors(actor, sassy, "rgba(0,255,0, 0.4)", 2));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 230920 || spells[a.spellIndex].id === 230201 ||//consuming hunger, burdern of pain
                        spells[a.spellIndex].id === 234661 || spells[a.spellIndex].id === 230959 ||//consuming hunter(p3), concealing murk
                        spells[a.spellIndex].id === 230362)//thundering shock
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Debuff Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 239375 || spells[a.spellIndex].id === 239362)//bufferfish(dps), bufferfish(healing)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            var endLoc = actor.getStateAtTime(auraState.endTime);
                            fishEvents.push({gain:1, time:auraState.time, x:loc.x, y:loc.y, actor: actor});
                            fishEvents.push({gain:0, time:auraState.endTime, x:endLoc.x, y:endLoc.y, actor: actor});
                            draw.sim.actorVisuals.addStates("bufferfish Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor), actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 239420)//slippery(dropped a fish)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            fishEvents.push({gain:0, time:auraState.time, x:loc.x, y:loc.y, actor:actor});
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 232732 || spells[a.spellIndex].id === 232754)//slicing tornado, hydra acid
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Stacking Debuff Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                        }
                    }
                }  
                else if(spells[a.spellIndex].id === 232913)//befowling ink
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var startLoc = actor.getStateAtTime(auraState.time);
                            var voidzoneDuration = 3000;
                            draw.sim.lowerVisuals.addStates("Ink pre-debuff", auraState.time-voidzoneDuration, voidzoneDuration,
                                generateCircleOnLocation(2,"rgb(50,0,50)", startLoc.x, startLoc.y));
                            draw.sim.actorVisuals.addStates("Debuff Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                            if(auraState.endTime-auraState.time >= 5950)
                            {
                                var endLoc = actor.getStateAtTime(auraState.endTime);
                                draw.sim.lowerVisuals.addStates("Ink post-debuff", auraState.endTime, voidzoneDuration,
                                    generateCircleOnLocation(2,"rgb(50,0,50)", endLoc.x, endLoc.y));
                            }
                            else
                            {
                                var loc = actor.getStateAtTime(auraState.endTime);
                                partialInks.push({time:auraState.time, endTime:auraState.endTime, x:loc.x, y:loc.y});
                            }
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 232745)//devouring maw(whale channel buff)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            saurkelFound = true;
                            draw.sim.lowerVisuals.addStates("whale inhale", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(20, "rgba(102, 0, 255, 0.5)", actor));
                            draw.sim.upperVisuals.addStates("whale insta-kill", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(10, "rgba(255,0,0,0.6)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 234621)//devouring maw(raidwide dot)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            devouringMaws.push({time:auraState.time, endTime:auraState.endTime});
                        }
                    }
                }
            });//foreach aura
        }//for actors
        if(fishEvents.length !== 0)
        {
            var fishIcon = new Image();
            fishIcon.src = this.filePath+"fish.jpg";

            /*var eIcon = new Image();
            eIcon.src = this.filePath+"fishE.jpg";

            var seIcon = new Image();
            seIcon.src = this.filePath+"fishSE.jpg";

            var sIcon = new Image();
            sIcon.src = this.filePath+"fishS.jpg";

            var swIcon = new Image();
            swIcon.src = this.filePath+"fishSW.jpg";

            var wIcon = new Image();
            wIcon.src = this.filePath+"fishW.jpg";*/

            var west =      {spawnX:1223.49, spawnY:-5785.41, x:1223.49, y:-5785.41, holder: null, lastTime:12000, icon:fishIcon};
            var southWest = {spawnX:1240.69, spawnY:-5773.08, x:1240.69, y:-5773.08, holder: null, lastTime:12000, icon:fishIcon};
            var south =     {spawnX:1264.59, spawnY:-5776.72, x:1264.59, y:-5776.72, holder: null, lastTime:12000, icon:fishIcon};
            var southEast = {spawnX:1275.58, spawnY:-5792.39, x:1275.58, y:-5792.39, holder: null, lastTime:12000, icon:fishIcon};
            var east =      {spawnX:1272.23, spawnY:-5814.09, x:1272.23, y:-5814.09, holder: null, lastTime:12000, icon:fishIcon};
            var fishies = [west, southWest, south, southEast, east];

            //53 blood appears, 1:00 blood despawns, 1:15 fish spawn, logs say its totally 6s of blood
            var sharkAttackI = 0;
            var sharkAttackTime = (sharkAttacks.length!==0?sharkAttacks[0]:Number.MAX_VALUE);
            fishEvents.sort(function(a,b){return a.time-b.time;});
            //clean out duplicate data
            var cleanList = [];
            for(var fei = 0; fei < fishEvents.length; fei++)
            {
                var fishEvent = fishEvents[fei];
                if(fishEvent.gain === 1)
                    cleanList.push(fishEvent);
                else
                {
                    var feip = fei-1;
                    var match = false;
                    while(feip >= 0 && fishEvent.time-fishEvents[feip].time < 1000)
                    {
                        var prevEvent = fishEvents[feip];
                        if(prevEvent.gain === 0 && prevEvent.actor === fishEvent.actor)
                        {
                            match = true;
                            break;
                        }
                        feip--;
                    }
                    if(!match)
                    {
                        cleanList.push(fishEvent)
                    }
                }
            }
            fishEvents = cleanList;

            for(var fei = 0; fei < fishEvents.length; fei++)
            {
                var fishEvent = fishEvents[fei];
                if(fishEvent.time > sharkAttackTime)
                {
                    //console.log("("+timeToString(sharkAttackTime,3)+") shark attack!");
                    for(var fi = 0; fi < fishies.length; fi++)
                    {
                        var fish = fishies[fi];
                        var startTime;
                        var duration;
                        if(sharkAttackTime-fish.lastTime > sharkAttackDelay)
                        {
                            startTime = sharkAttackTime-sharkAttackDelay;
                            duration = sharkAttackDelay
                        }
                        else
                        {
                            duration = sharkAttackTime-fish.lastTime;
                            startTime = sharkAttackTime - duration;
                        }

                        if(fish.holder === null)
                        {
                            draw.sim.upperVisuals.addStates("ground fish", fish.lastTime, sharkAttackTime-fish.lastTime,
                                generateIconOnLocation(fish.icon, fish.x, fish.y));
                            draw.sim.lowerVisuals.addStates("shark attack warning", startTime, duration,
                                generateCircleOnLocation(6, "rgba(255,0,0,0.5)", fish.x, fish.y));
                        }
                        else
                        {
                            draw.sim.lowerVisuals.addStates("shark attack warning", startTime, duration,
                                generateCircleOnActor(6, "rgba(255,0,0,0.5)", fish.holder));
                        }
                        fish.lastTime = sharkAttackTime+15000;
                        fish.x = fish.spawnX;
                        fish.y = fish.spawnY;
                        fish.holder = null;
                    }
                    sharkAttackI++;
                    sharkAttackTime = (sharkAttacks.length > sharkAttackI)?sharkAttacks[sharkAttackI]:Number.MAX_VALUE;
                }

                if(fishEvent.gain)
                {//the fish was picked up, find the closest free fish
                    var minDist = 100000, closestFish = null;
                    for(var fi = 0; fi < fishies.length; fi++)
                    {
                        var fish = fishies[fi];
                        if(fish.holder !== null)
                            continue;
                        var dx = fishEvent.x - fish.x;
                        var dy = fishEvent.y - fish.y;
                        var dist = Math.sqrt(dx*dx + dy*dy);
                        if(dist < minDist)
                        {
                            minDist = dist;
                            closestFish = fish;
                        }
                    }
                    if(closestFish !== null)
                    {
                        var duration = fishEvent.time-closestFish.lastTime;
                        if(duration < 0)
                            duration = 0;
                        draw.sim.upperVisuals.addStates("ground fish", closestFish.lastTime, duration,
                            generateIconOnLocation(closestFish.icon, closestFish.x, closestFish.y));
                        if(sharkAttackTime - fishEvent.time <= sharkAttackDelay)
                        {
                            var startWarning;
                            if(matchingFish.lastTime > (sharkAttackTime-sharkAttackDelay))
                            {
                                startWarning = matchingFish.lastTime;
                            }
                            else
                                startWarning = sharkAttackTime-sharkAttackDelay;
                            draw.sim.lowerVisuals.addStates("shark attack warning", startWarning, fishEvent.time-startWarning,
                                generateCircleOnLocation(6, "rgba(255,0,0,0.5)", fish.x, fish.y));
                        }
                        closestFish.holder = fishEvent.actor;
                        closestFish.lastTime = fishEvent.time;
                    }
                }
                else
                {//fish was droped, record where it lands
                    var minDist = 100000, closestFish = null, matchingFish = null;;
                    for(var fi = 0; fi < fishies.length; fi++)
                    {
                        var fish = fishies[fi];
                        if(fish.holder === fishEvent.actor)
                        {
                            matchingFish = fish;
                            break;
                        }
                        if(fish.holder !== null)
                            continue;
                        var dx = fishEvent.x - fish.x;
                        var dy = fishEvent.y - fish.y;
                        var dist = Math.sqrt(dx*dx + dy*dy);
                        if(dist < minDist)
                        {
                            minDist = dist;
                            closestFish = fish;
                        }
                    }
                    if(matchingFish)
                    {
                        if(sharkAttackTime - fishEvent.time <= sharkAttackDelay)
                        {
                            var startWarning;
                            if(matchingFish.lastTime > (sharkAttackTime-sharkAttackDelay))
                            {
                                startWarning = matchingFish.lastTime;
                            }
                            else
                                startWarning = sharkAttackTime-sharkAttackDelay;
                            draw.sim.lowerVisuals.addStates("shark attack warning", startWarning, fishEvent.time-startWarning,
                                generateCircleOnActor(6, "rgba(255,0,0,0.5)", matchingFish.holder));
                        }

                        matchingFish.holder = null;
                        matchingFish.x = fishEvent.x;
                        matchingFish.y = fishEvent.y;
                        matchingFish.lastTime = fishEvent.time;
                    }
                }
                //console.log(fei+"("+timeToString(fishEvent.time,3)+"): ("+fishEvent.x.toFixed(2)+", "+fishEvent.y.toFixed(2)+") "+(fishEvent.gain?"picked up by ":"dropped by ")+fishEvent.actor.name);
            }//for fish events
            //add the ground fish after the final shark attack
            for(var fi = 0; fi < fishies.length; fi++)
            {
                var fish = fishies[fi];
                if(fish.holder === null)
                {
                    draw.sim.upperVisuals.addStates("ground fish", fish.lastTime, Number.MAX_VALUE,
                        generateIconOnLocation(fish.icon, fish.x, fish.y));
                }
            }
        }
        //shark bites burden zaps

        if(sharkBites.length !== 0)
        {
            sharkBites.sort(function(a,b){return a.time-b.time;});
            for(var sbi = 0; sbi < sharkBites.length; sbi++)
            {
                var bite = sharkBites[sbi];
                //console.log("shark bite("+timeToString(bite.time,3)+"): from "+ bite.src.name +" to "+bite.target.name)

            }
        }
        if(burdenZaps.length !== 0)
        {
            burdenZaps.sort(function(a,b){return a.time-b.time;});
            var lastZap = 0;
            for(var bzi = 0; bzi < burdenZaps.length; bzi++)
            {
                var zap = burdenZaps[bzi];
                if(zap.time - lastZap >= 50)
                {
                    //console.log("zap("+timeToString(zap.time,3)+"): from "+zap.src.name+" to  "+zap.target.name);
                    lastZap = zap.time;
                }
                
            }
        }
        if(!sarukelFound)//at some point sarukel stoped showing up in the logs, still need to deduce his location
        {
            devouringMaws.sort(function(a,b){return a.time-b.time;});
            var mawTimes = [];
            for(var dmi = 0; dmi < devouringMaws.length; dmi++)
            {
                var dm = devouringMaws[dmi];
                var matchFound = false;
                for(var mti = 0; mti < mawTimes.length; mti++)
                {
                    var mt = mawTimes[mti];
                    if(Math.abs(dm.time-mt.time)<30000)
                    {
                        if(dm.time < mt.time)
                            mt.time = dm.time;
                        if(dm.endTime > mt.endTime)
                            mt.endTime = dm.endTime;
                        matchFound = true;
                    }
                }
                if(!matchFound)
                {
                    mawTimes.push({time:dm.time, endTime:dm.endTime});
                }
            }
            for(var mti = 0; mti < mawTimes.length; mti++)
            {
                var maw = mawTimes[mti];
                var x = y = count = 0;
                for(var pii = 0; pii < partialInks.length; pii++)
                {
                    var ink = partialInks[pii];
                    if(ink.time >= maw.time && ink.endTime <= maw.endTime)
                    {
                        x += ink.x;
                        y += ink.y;
                        count++;
                    }
                }
                if(count !== 0)
                {
                    x /= count;
                    y /= count;
                    //room center: (1247.30,-5800.75)
                    var dx = x - 1247.30;
                    var dy = y - (-5800.75);
                    var length = Math.sqrt(dx*dx+dy*dy);
                    dx /= length;//normalize the vector
                    dy /= length;
                    var sx = 1247.3 + dx*42;
                    var sy = -5800.75 + dy*42;
                    draw.sim.lowerVisuals.addStates("whale inhale", maw.time, maw.endTime-maw.time,
                        generateCircleOnLocation(20, "rgba(102, 0, 255, 0.5)", sx, sy));
                    draw.sim.upperVisuals.addStates("whale insta-kill", maw.time, maw.endTime-maw.time,
                        generateCircleOnLocation(10, "rgba(255,0,0,0.6)", sx, sy));

                }
            }
        }
    };//setupVisuals()
};//initSasszine()

function initSistersOfTheMoon(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/SistersOfTheMoon/";

    newEncounter.mobs.push(new EncounterMob("Priestess Lunaspyre", newEncounter.filePath+"sisters.jpg", true, 0, 118518));
    newEncounter.mobs.push(new EncounterMob("Captain Yathae Moonstrike", newEncounter.filePath+"sisters.jpg", true, 0, 118374));
    newEncounter.mobs.push(new EncounterMob("Huntress Kasparian", newEncounter.filePath+"sisters.jpg", true, 0, 118523));
    newEncounter.mobs.push(new EncounterMob("Moontalon", newEncounter.filePath+"owl.jpg", false, null, 119205));
    newEncounter.mobs.push(new EncounterMob("Glaive Target", newEncounter.filePath+"glaive.jpg", false, null, 119054));
    /*newEncounter.mobs.set("Priestess Lunaspyre",
        new EncounterMob("Priestess Lunaspyre", newEncounter.filePath+"sisters.jpg", true, 0));
    newEncounter.mobs.set("Captain Yathae Moonstrike",
        new EncounterMob("Captain Yathae Moonstrike", newEncounter.filePath+"sisters.jpg", true, 0));
    newEncounter.mobs.set("Huntress Kasparian",
        new EncounterMob("Huntress Kasparian", newEncounter.filePath+"sisters.jpg", true, 0));
    newEncounter.mobs.set("Moontalon",
        new EncounterMob("Moontalon", newEncounter.filePath+"owl.jpg", false));
    newEncounter.mobs.set("Glaive Target",
        new EncounterMob("Glaive Target", null, false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"tomb4.png",0.971,514,-6560);
    newEncounter.setupVisuals = function()
    {
        var blackWhiteIcon = new Image();
        blackWhiteIcon.src = this.filePath+"sistersBW.jpg";
        var glaive = new Image();
        glaive.src = newEncounter.filePath+"glaive.jpg";
        var avs = [];
        var impDrops = [];

        this.addPhase(1, "green", 0);
        var huntress = lookupActorByID(118523)[0];//huntress
        var captain = lookupActorByID(118374)[0];//captain
        var priestess = lookupActorByID(118518)[0];//priestess

        var p2StartTime = p3StartTime = Number.MAX_VALUE;

        if(!huntress || !captain || !priestess)
            return;

        for(var si = 0; si < huntress.states.SA.length; si++)
        {
            var state = huntress.states.SA[si];
            if(state.curHP/state.maxHP <= 0.7)
            {
                p2StartTime = state.time;
                this.addPhase(2, "yellow", p2StartTime);
                break;
            }
        }
        for(var si = 0; si < captain.states.SA.length; si++)
        {
            var state = captain.states.SA[si];
            if(state.curHP/state.maxHP <= 0.4)
            {
                p3StartTime = state.time;
                this.addPhase(3,"red", p3StartTime);
                break;
            }
        }
        for(var ci = 0; ci < huntress.casts.CA.length; ci++)
        {
            var cast = huntress.casts.CA[ci];
            if(spells[cast.spellIndex].id === 239379)//glaive storm
            {
                draw.timeline.addCast(cast);
                var path = getProjectilePath(huntress, actors[cast.target], 12, cast.time+cast.castLength);
                var startTime = cast.time+cast.castLength;
                var endTime = path[path.length-1].time;
                draw.sim.upperVisuals.addStates("glaive storm 1",startTime,endTime-startTime,
                    generateProjectileBetweenActors(huntress, actors[cast.target], path, "rgb(255,0,0)", 1, true, glaive));
            }
        }
        var glaiveTargets = lookupActorByID(119054);//glaive storm casters
        for(var gi = 0; gi < glaiveTargets.length; gi++)
        {
            var g = glaiveTargets[gi];
            for(var ci = 0; ci < g.casts.CA.length; ci++)
            {
                var cast = g.casts.CA[ci];
                if(spells[cast.spellIndex].id === 239383 || spells[cast.spellIndex].id === 239386)//glaive storm 2, glaive storm 3
                {
                    var startTime = cast.time+cast.castLength+500;
                    var path = getProjectilePath(g, actors[cast.target], 12, startTime);
                    var endTime = path[path.length-1].time;
                    draw.sim.upperVisuals.addStates("glaive storm 2 and 3",startTime,endTime-startTime,
                        generateProjectileBetweenActors(g, actors[cast.target], path, "rgb(255,0,0)", 1, true, glaive));
                }
            }
        }
        /*var envir = actors[0];
        for(var di = 0; di < envir.damageDone.AA.length; di++)
        {
            var dmg = envir.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 236480)//glaive storm
            {
                draw.sim.upperVisuals.addStates("gs debug", dmg.time, 500, 
                    generateCircleOnActor(2.5, "rgb(0,255,0)", actors[dmg.target]));
            }
        }*/
        for(var ci = 0; ci < captain.casts.CA.length; ci++)
        {
            var cast = captain.casts.CA[ci];
            if(spells[cast.spellIndex].id === 236305)//incorporeal shot
                draw.timeline.addCast(cast);
        }
        for(var ci = 0; ci < captain.casts.CA.length; ci++)
        {
            var cast = captain.casts.CA[ci];
            if(spells[cast.spellIndex].id === 233263)//embrace of the eclipse
                draw.timeline.addCast(cast);
        }

        if(p2StartTime !== Number.MAX_VALUE)
        {
            draw.sim.actorVisuals.addStates("Huntress Inactive", p2StartTime, Number.MAX_VALUE,
                generateIconOnActor(blackWhiteIcon, huntress, null, null, 1.1), huntress);
            draw.sim.actorVisuals.addStates("Captain Inactive p1", 0, p2StartTime,
                generateIconOnActor(blackWhiteIcon, captain, null, null, 1.1), captain);
        }
        if(p3StartTime !== Number.MAX_VALUE)
        {
            draw.sim.actorVisuals.addStates("Captain Inactive p3", p3StartTime, Number.MAX_VALUE,
                generateIconOnActor(blackWhiteIcon, captain, null, null, 1.1), captain);
        }
        draw.sim.actorVisuals.addStates("Priestess Inactive", 0, p3StartTime,
            generateIconOnActor(blackWhiteIcon, priestess, null, null, 1.1), priestess);

        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.class.mobID === 119205)//moontalon
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 236697)//deathly screech
                    {
                        draw.sim.actorVisuals.addStates("deathly screech cast", cast.time, 1000,
                            generateCastOnActor(cast,actor),actor);
                    }
                }
            }

            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 236305)//Incorporeal Shot
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Incorporeal Shot Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                            draw.sim.upperVisuals.addStates("Incorporeal Shot Line", auraState.time, auraState.endTime-auraState.time,
                                generateLineBetweenActors(actor, actors[a.source], "rgba(255,0,0,0.4)", 1.5));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 236519 || spells[a.spellIndex].id === 236596 ||//Moon Burn, Rapid Shot
                     spells[a.spellIndex].id === 236550)//discorporiate
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Debuff Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                        }
                        else if(auraState instanceof a.stateRemoved && spells[a.spellIndex].id !== 236596)//not rapid shot ending
                        {
                            var aState = actor.getStateAtTime(auraState.time+50);
                            if(aState instanceof State)
                                impDrops.push({time:auraState.time, actor:actor, spell:a.spellIndex});
                            /*else 
                                console.log("misc debuff, dead after")*/
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 233263 ||spells[a.spellIndex].id === 233264)//Embrace of the Eclipse(player absorb, boss absorb)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Embrace of the Eclipse Absorb", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                            if(auraState.endTime-auraState.time >=11990)
                            {
                                var radius = spells[a.spellIndex].id === 233263?8:30;
                                draw.sim.lowerVisuals.addStates("Embrace of the Eclipse Explosion", auraState.time, auraState.endTime-auraState.time,
                                    generateCircleOnActor(8, "rgba(255,0,0,0.3)", actor));
                            }
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 239264)//Lunar Fire(tank dot)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Dot Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor), actor);
                        }
                    }
                }                
                else if(spells[a.spellIndex].id === 234996)//Umbral Suffusion(shadow increase)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Shadow Increase", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(null, "rgba(89,0,255,0.6)", actor), actor);
                        }
                        else if(auraState instanceof a.stateRemoved)
                        {
                            var aState = actor.getStateAtTime(auraState.time+50);
                            if(aState instanceof State)
                            {
                                var arcaneIncrease = actor.auras.getStateAtTime(234995, auraState.time+50);
                                if(arcaneIncrease)
                                {
                                    //console.log("shadow drop FOUND")
                                   impDrops.push({time:auraState.time, actor:actor, spell:a.spellIndex}); 
                                }
                                else{}
                                    //console.log("shadow drop, no arcane gain")
                                
                            }
                            else{}
                                //console.log("shadow drop, dead afterweards")
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 234995)//Lunar Suffusion(arcane increase)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Arcane Increase", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(null, "rgba(255,0,89,0.6)", actor), actor);
                        }
                        else if(auraState instanceof a.stateRemoved)
                        {
                            var aState = actor.getStateAtTime(auraState.time+50);
                            if(aState instanceof State)
                            {
                                var shadowIncrease = actor.auras.getStateAtTime(234996, auraState.time+50);
                                if(shadowIncrease)
                                {
                                    //console.log("arcane drop FOUND");
                                   impDrops.push({time:auraState.time, actor:actor, spell:a.spellIndex}); 
                                }
                                else{}  
                                    //console.log("arcane drop, no shadow gain");
                            }
                            else{}
                                //console.log("arcane drop, dead afterwards");
                        }
                    }
                }

                else if(spells[a.spellIndex].id === 237561)//Twilight Glaive
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        var duration = auraState.endTime-auraState.time;
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Dot Icon", auraState.time, duration,
                                generateAuraIconOnActor(a, actor), actor);
                        }
                        if(duration >= 3000-50)
                        {
                            draw.sim.upperVisuals.addStates("twilight Gliave Warning", auraState.time, duration,
                                generateLineBetweenActors(actor, actors[a.source], "rgb(255,0,255)",1,null, null, true));

                            var outPath = getProjectilePath(actors[a.source], actor, 20, auraState.endTime);
                            draw.sim.upperVisuals.addStates("twilight Glaive outgoing", auraState.endTime, outPath[outPath.length-1].time-auraState.endTime,
                                generateProjectileBetweenActors(actors[a.source], actor, outPath, "rgb(255,0,255)", 1, true, glaive));

                            var returnPath = getProjectilePath(actor, actors[a.source], 20, outPath[outPath.length-1].time);
                            draw.sim.upperVisuals.addStates("twilight Glaive incoming", returnPath[0].time, returnPath[returnPath.length-1].time-returnPath[0].time,
                                generateProjectileBetweenActors(actors[a.source], actor, returnPath, "rgb(255,0,255)", 1, true, glaive, true));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 236330)//astral vulnerability
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var stacks = 0;
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                            stacks = 1;
                        if(auraState instanceof a.stateStack)
                            stacks = auraState.stackCount;
                        if(auraState instanceof a.stateRemoved && actor.getStateAtTime(auraState.time+30) instanceof Death)
                            continue;
                        var foundMatch = false;
                        for(var avsi = 0; avsi < avs.length; avsi++)
                        {
                            var timeDelta = Math.abs(avs[avsi].time - auraState.time);
                            if(timeDelta < 30)
                            {
                                foundMatch = true;
                                if(avs[avsi].stacks < stacks)
                                    avs[avsi].stacks = stacks;
                                break;
                            }
                        }
                        if(!foundMatch)
                        {
                            avs.push({time:auraState.time, stacks:stacks});
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 236712)//Lunar Beacon
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Lunar Beacon Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                        
                            if(auraState.endTime - auraState.time >= 5950)
                            {
                                for(var bt = auraState.endTime; bt < auraState.endTime+3000; bt+=1000)
                                {
                                    var loc = actor.getStateAtTime(bt);
                                    if(loc instanceof Death)
                                        break;
                                    draw.sim.lowerVisuals.addStates("Lunar Barrage Voidzone", bt, Number.MAX_VALUE,
                                        generateCircleOnLocation(8, "rgba(0,0,150, 0.4)", loc.x, loc.y));
                                }
                            }
                        }
                    }
                }
            });//foreach aura
        }//for actors
        if(avs.length !== 0)
        {
            //add a start state and sort the data
            avs.push({time:0, stacks:0});
            avs.sort(function(a,b){return a.time-b.time;});
            impDrops.sort(function(a,b){return a.time-b.time;});

            var msg = [];
            var idi = 0;
            //loop through each AV change
            for(var avsi = 0; avsi < avs.length; avsi++)
            {
                var av = avs[avsi];
                av.msg = [];
                if(av.stacks === 0)
                {
                    msg = [];
                    continue;
                }
                //match the debuff drops to the AV change
                for(idi; idi < impDrops.length; idi++)
                {
                    var id = impDrops[idi];
                    var tDelta = Math.abs(id.time-av.time);
                    if(av.time > id.time || tDelta <= 60)
                    {
                        if(msg.length !== 0)
                        {
                            var lastMsg = msg[msg.length-1];
                            if(lastMsg.actor == id.actor && id.time-lastMsg.time <= 60)
                            {
                                lastMsg.spells.push(id.spell);
                                continue;
                            }
                        }
                        
                        msg.push({time:id.time, actor:id.actor, spells:[id.spell]});
                    }
                    else
                        break;
                }
                
                for(var mi = 0; mi < msg.length; mi++)
                {
                    var m = msg[mi];
                    av.msg.push({time:m.time, actor:m.actor, spells:m.spells});
                }
            }

            var avIcon = new Image();
            avIcon.src = this.filePath+"astralVulnerability.jpg";
            draw.sim.upperVisuals.addStates("Astral Vulnerability Count", 0, Number.MAX_VALUE,
                generateFakeAuraIconWithStacksOnLocation(avIcon, "left", "bottom", avs, null, 2000, 5));
        }
    };//newEncounter
};//initSistersOfTheMoon()

function initDesolateHost(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/DesolateHost/";
    newEncounter.mobs.push(new EncounterMob("Engine of Souls", newEncounter.filePath+"engine.jpg", true, 0, 118460));//the boss
    newEncounter.mobs.push(new EncounterMob("Engine of Souls", newEncounter.filePath+"engine.jpg", false, null, 118924));//casts cones
    newEncounter.mobs.push(new EncounterMob("Soul Queen Dejahna", newEncounter.filePath+"white face.jpg", true, 0, 118462));
    newEncounter.mobs.push(new EncounterMob("The Desolate Host", newEncounter.filePath+"desolateHost.jpg", true, null, 119072));
    newEncounter.mobs.push(new EncounterMob("Soul Residue", newEncounter.filePath+"soulResidue.jpg", false, null, 118730));//spirit realm
    newEncounter.mobs.push(new EncounterMob("Soul Residue", newEncounter.filePath+"soulResidue.jpg", false, null, 119941));//phys realm
    newEncounter.mobs.push(new EncounterMob("Fallen Priestess", newEncounter.filePath+"cloth chest.jpg", false, null, 118729));//spirit realm
    newEncounter.mobs.push(new EncounterMob("Fallen Priestess", newEncounter.filePath+"cloth chest.jpg", false, null, 119940));//phys realm
    newEncounter.mobs.push(new EncounterMob("Ghastly Bonewarden", newEncounter.filePath+"purp cloth chest.jpg", false, null, 119939));//spirit realm
    newEncounter.mobs.push(new EncounterMob("Ghastly Bonewarden", newEncounter.filePath+"purp cloth chest.jpg", false, null, 118728));//phys realm
    newEncounter.mobs.push(new EncounterMob("Reanimated Templar", newEncounter.filePath+"plate chest.jpg", false, null, 119938));//spirit realm
    newEncounter.mobs.push(new EncounterMob("Reanimated Templar", newEncounter.filePath+"plate chest.jpg", false, null, 118715));//phys realm

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"tomb4.png",0.971,514,-6560);
    
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(118730, 20000);//soul residue, spirit
        cd.addDamageWindow(119941, 20000);//soul residue, phys
        cd.addDamageWindow(118729, 20000);//preistess, spirit
        cd.addDamageWindow(119940, 20000);//priestess, phys
        cd.addDamageWindow(119939, 20000);//bonewarden, spirit
        cd.addDamageWindow(118728, 20000);//bonewarden, phys
        cd.addDamageWindow(119938, 20000);//templar, spirit
        cd.addDamageWindow(118715, 20000);//templar, phys
    };

    newEncounter.setupVisuals = function()
    {
        
        var addRealmRange = function(realm, actor, start, end)
        {
            //realm 0 = spirit, 1 = phys
            if(actor.states.SA.length === 0)
                return;
            start = start||actor.states.SA[0].time;
            end = end||actor.states.SA[actor.states.SA.length-1].time;
            var color = realm?"rgba(200,200,200,0.4)":"rgba(155,0,155,0.2)";
            draw.sim.lowerVisuals.addStates("Realm Range", start, end-start,
                generateCircleOnActor(8, color, actor));
        }
        this.addPhase(1, "green", 0);
        var engine = lookupActorByID(118460)[0];//engine of souls boss
        if(!engine)
            return;
        for(var ci = 0; ci < engine.casts.CA.length; ci++)
        {
            var cast = engine.casts.CA[ci];
            if(spells[cast.spellIndex].id === 238570)//tormented cries
            {
                draw.timeline.addCast(cast);
            }
        }
        var soulQueen = lookupActorByID(118462)[0];//soul queen dejana
        if(soulQueen)
        {
            for(var ci = 0; ci < soulQueen.casts.CA.length; ci++)
            {
                var cast = soulQueen.casts.CA[ci];
                if(spells[cast.spellIndex].id === 236072)//wailing cries
                {
                    draw.timeline.addCast(cast);
                }
            }
        }
        var desolateHost = lookupActorByID(119072)[0];//the desolate host
        if(desolateHost)
        {
            this.addPhase(2, "yellow", desolateHost.states.SA[0].time);
            for(var ci = 0; ci < desolateHost.casts.CA.length; ci++)
            {
                var cast = desolateHost.casts.CA[ci];
                if(spells[cast.spellIndex].id === 236542)//sundering doom(phys split)
                {
                    draw.timeline.addCast(cast);
                    draw.sim.lowerVisuals.addStates("Sundering Doom Range", cast.time, cast.castLength,
                        generateCircleOnActor(15, "rgb(200,200,200)", desolateHost));
                }
                else if(spells[cast.spellIndex].id === 236544)//doomed sundering(spirit split)
                {
                    draw.timeline.addCast(cast);
                    draw.sim.lowerVisuals.addStates("Doomed Sundering Range", cast.time, cast.castLength,
                        generateCircleOnActor(15, "rgb(255,0,255)", desolateHost));
                }
            }
        }
        var soulbinds = [];


        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.class.mobID === 118460 || actor.class.mobID === 119941 ||//engine of souls, soul residue(phys)
                 actor.class.mobID === 119940 || actor.class.mobID === 118728 ||//fallen priestess(phys), ghastly bonewarden(phys)
                  actor.class.mobID === 118715)//reanimnated templar(phys)
            {
                addRealmRange(1, actor);
            }
            else if(actor.class.mobID === 118462 || actor.class.mobID === 118730 ||//soul queen, soul residue(spirit)
                actor.class.mobID === 118729 || actor.class.mobID === 119939 ||//fallen priestess(spirit), ghastly bonewarden(spirit)
                actor.class.mobID === 119938)//reanimated templar(spirit)
            {
                addRealmRange(0, actor);
            }
            if(actor.class.mobID === 118730 || actor.class.mobID === 119941)//soul residues
            {
                //4s delay on spawn
                //2s between pools
                //40s lifespan
                if(actor.states.SA.length === 0)
                    continue;
                var spawnTime = actor.states.SA[0].time;
                var lastState = actor.states.SA[actor.states.SA.length-1];
                var deathTime = actor.states.SA[actor.states.SA.length-1].time;
                for(var timei = spawnTime+4000; timei < deathTime;timei +=2000)
                {
                    var loc = actor.getStateAtTime(timei);
                    draw.sim.lowerVisuals.addStates("Soul Residue Voidzone", timei, 40000,
                        generateCircleOnLocation(3, "rgb(80,130,0)", loc.x, loc.y));
                }
                if(lastState instanceof Death)
                {
                    draw.sim.upperVisuals.addStates("soul residue death explosion", lastState.time, 1000,
                        generateCircleOnLocation(5, "rgba(255,0,0,0.4)", lastState.x, lastState.y));
                }

            }
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 236459)//soulbind
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            soulbinds.push({actor:actor, auraState:auraState, a:a});
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 238018)//tormented cries
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            
                            var width = Math.PI/12;
                            var duration = auraState.endTime - auraState.time;
                            draw.sim.lowerVisuals.addStates("Tormented Cries Warning", auraState.time, duration,
                                generateConeBetweenActors(engine, actor, width, 120, "rgba(150,0,150,0.5)"));
                            draw.sim.actorVisuals.addStates("Tormented Cries Icon", auraState.time, duration,
                                generateAuraIconOnActor(a, actor), actor);
                            if(duration >= 3950)
                            {
                                var targLoc = actor.getStateAtTime(auraState.endTime);
                                var castLoc = engine.getStateAtTime(auraState.endTime);
                                var direction = getAngleBetweenPoints(castLoc.x, castLoc.y, targLoc.x, targLoc.y);
                                draw.sim.lowerVisuals.addStates("Tormented Cries Voidzone", auraState.endTime, 30000,
                                    generateConeOnActor(engine, direction, width, 120, "rgb(150, 0, 150)" ));
                            }
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 236515)//shattering scream
                {
                    var lastTime = 0;
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("shattering scream icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor), actor);
                        }
                        else if(auraState instanceof a.stateStack)
                        {
                            //sometimes the stacks stick around, limit the rest of the visual
                            var duration = auraState.time-lastTime;
                            if(duration > 2000)
                                duration = 1000;
                            draw.sim.upperVisuals.addStates("Shattering scream beam", lastTime, duration,
                                generateLineBetweenActors(actor, actors[a.source], "rgb(255,0,255)", auraState.stackCount, null, null, true));
                            if(auraState.stackCount === 5)
                                draw.sim.upperVisuals.addStates("shattering Scream explosion", auraState.time, 1000,
                                    generateCircleOnActor(8, "rgba(255,0,255,0.4)", actor));
                        }
                            lastTime = auraState.time;
                    }
                }
                else if(spells[a.spellIndex].id === 236513 || spells[a.spellIndex].id === 236138 ||//bonecage armor, wither(healers)
                        spells[a.spellIndex].id === 236131 || /*spells[a.spellIndex].id === 236361 ||*///wither(dps), //spirit chains
                        spells[a.spellIndex].id === 238442)//spear of anguish(heal absorb)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("debuff icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 235924)//spear of anguish(warning)
                {
                    var lastStart = 0;
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("debuff icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor), actor);
                            draw.sim.upperVisuals.addStates("Spear Range Warning", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(5, "rgba(255,0,0,0.5)", actor));
                        }
                    }
                }
            });//foreach aura
        }//foreach actor
        soulbinds.sort(function(a,b){return a.auraState.time - b.auraState.time;});
        for(var si = 0; si < soulbinds.length; si++)
        {
            var sb1 = soulbinds[si];
            var sb2 = soulbinds[si+1];
            if(sb2 === undefined || Math.abs(sb1.auraState.time - sb2.auraState.time) > 100)
                continue;

            var startTime = (sb1.auraState.time < sb2.auraState.time)?sb1.auraState.time:sb2.auraState.time;
            var endTime = (sb1.auraState.endTime < sb2.auraState.endTime)?sb1.auraState.endTime:sb2.auraState.endTime;
            draw.sim.upperVisuals.addStates("Soulbind Link", startTime, endTime-startTime,
                generateLineBetweenActors(sb1.actor, sb2.actor,"rgb(0,255,0)",2, null, null, true));
            draw.sim.actorVisuals.addStates("Soulbind Icon", sb1.auraState.time, sb1.auraState.endTime-sb1.auraState.time,
                generateAuraIconOnActor(sb1.a, sb1.actor), sb1.actor);
            draw.sim.actorVisuals.addStates("Soulbind Icon", sb2.auraState.time, sb2.auraState.endTime-sb2.auraState.time,
                generateAuraIconOnActor(sb2.a, sb2.actor), sb2.actor);
            draw.sim.lowerVisuals.addStates("Soulbind Range", sb1.auraState.time, sb1.auraState.endTime-sb1.auraState.time,
                generateCircleOnActor(10, "rgba(0,255, 0, 0.5)", sb1.actor));
            draw.sim.lowerVisuals.addStates("Soulbind Range", sb2.auraState.time, sb2.auraState.endTime-sb2.auraState.time,
                generateCircleOnActor(10, "rgba(0,255, 0, 0.5)", sb2.actor));
        }
    };//setupVisuals()
};//initDesolateHost()

function initMaidenOfVigilance(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/MaidenOfVigilance/";

    newEncounter.mobs.push(new EncounterMob("Maiden of Vigilance", newEncounter.filePath+"maiden.jpg", true, 0, 118289));
    /*newEncounter.mobs.set("Maiden of Vigilance",
        new EncounterMob("Maiden of Vigilance", newEncounter.filePath+"maiden.jpg", true, 0));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"tomb5.png",0.402,591,-6453);
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        var explosions = [];
        var maiden = lookupActorByID(118289)[0];//maiden
        if(!maiden)
            return;
        for(var ci = 0; ci < maiden.casts.CA.length; ci++)
        {
            var cast = maiden.casts.CA[ci];
            if(spells[cast.spellIndex].id === 235271 || spells[cast.spellIndex].id === 241635 ||//infusion, hammer of creation
                spells[cast.spellIndex].id === 241636)//hammer of obliteration
            {
                draw.timeline.addCast(cast);

                var color = null;
                if(spells[cast.spellIndex].id === 241635)//hammer of creation
                    color = "255,200,0";
                if(spells[cast.spellIndex].id === 241636)//hammer of oliteration
                    color = "0,255,0";
                if(color)
                {
                    var loc = actors[cast.target].getStateAtTime(cast.time+cast.castLength);
                    var maidenLoc = maiden.getStateAtTime(cast.time+cast.castLength);
                    var direction = getAngleBetweenPoints(maidenLoc.x, maidenLoc.y, loc.x, loc.y);

                    draw.sim.upperVisuals.addStates("Hammer Cone", cast.time+cast.castLength, 1000,
                        generateConeOnActor(maiden, direction, Math.PI/3.5, 20, "rgba("+color+",0.5)"));
                    if(this.isHeroic() || this.isMythic())
                    {
                        draw.sim.lowerVisuals.addStates("Hammer Voidzone", cast.time+cast.castLength, 5000,
                            generateCircleOnLocation(4, "rgb("+color+")", loc.x, loc.y));
                    }
                }
            }
        }
        var envir = actors[0];
        for(var di = 0; di < envir.damageDone.AA.length; di++)
        {
            var dmg = envir.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 238420)//fel echoes
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                draw.sim.upperVisuals.addStates("Fel Echoes Hit", dmg.time-2000, 2000,
                    generateCircleOnLocation(1,"rgb(0,255,0)", loc.x, loc.y));
            }
            if(spells[dmg.spellIndex].id === 238037)//light echoes
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                draw.sim.upperVisuals.addStates("Light Echoes Hit", dmg.time-2000, 2000,
                    generateCircleOnLocation(1,"rgb(255,200,0)", loc.x, loc.y));
            }    
        }
        var thisEncounter = this;
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.class instanceof PlayerClass)
            {
                for(var di = 0; di < actor.damageDone.AA.length; di++)
                {
                    var dmg = actor.damageDone.AA[di];
                    if(spells[dmg.spellIndex].id === 235138)//unstable soul(explosion)
                    {
                        var matchFound = false;
                        for(var ei = 0; ei < explosions.length; ei++)
                        {
                            var exp = explosions[ei];
                            if(Math.abs(exp.time-dmg.time) <= 1000)
                            {
                                matchFound = true;
                                break;
                            }
                        }
                        if(!matchFound)
                            explosions.push({time:dmg.time, actor:actor});
                    }
                }
            }
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 235240)//fel infusion
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Fel Infusion Glow", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(null, "rgba(0,255,0,0.5)", actor) ,actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 235213)//light infusion
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Light Infusion Glow", auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(null, "rgba(255,200,0,0.5)", actor) ,actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 235117 || spells[a.spellIndex].id === 243276 ||//unstable soul, unstable soul(mythic)
                    spells[a.spellIndex].id === 241593 || spells[a.spellIndex].id === 235028)//aegwyn's ward, titanic bulwark
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var duration = auraState.endTime-auraState.time;
                            draw.sim.actorVisuals.addStates("Debuff Icon", auraState.time, duration,
                                generateAuraIconOnActor(a, actor) ,actor);
                            if(spells[a.spellIndex].id === 235028)//titanic bulwark
                            {
                                thisEncounter.addPhase(2, "yellow", auraState.time);
                                thisEncounter.addPhase(1, "green", auraState.endTime);
                            }
                            else if(spells[a.spellIndex].id === 235117 ||//unstable soul
                                    spells[a.spellIndex].id === 243276)//unstable soul(mythic)
                            {
                                for(var ei = 0; ei < explosions.length; ei++)
                                {
                                    var exp = explosions[ei];
                                    if(exp.actor === actor && Math.abs(exp.time - auraState.endTime) < 1000)
                                    {
                                        draw.sim.lowerVisuals.addStates("Unstable Soul Hit",auraState.time, auraState.endTime - auraState.time,
                                            generateCircleOnActor(25, "rgba(255,0,0,0.2)", actor));
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                else if(spells[a.spellIndex].id === 235538 || spells[a.spellIndex].id === 235534)//Demon's Vigor, Creator's Grace(p2 dmg buff)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Debuff Icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor) ,actor);
                        }
                    }
                }
            });
        }//forActors
    };//newEncounter
};//initMaidenOfVigialnce()

function initFallenAvatar(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/FallenAvatar/";
    
    newEncounter.mobs.push(new EncounterMob("Fallen Avatar", newEncounter.filePath+"fallen avatar.jpg", true, 0, 116939));
    newEncounter.mobs.push(new EncounterMob("Maiden of Valor", newEncounter.filePath+"maiden.jpg", true, 0, 117264));
    newEncounter.mobs.push(new EncounterMob("Containment Pylon", newEncounter.filePath+"obelisk.jpg", false, null, 117279));
    /*newEncounter.mobs.set("Fallen Avatar",
        new EncounterMob("Fallen Avatar", newEncounter.filePath+"fallen avatar.jpg", true, 0));
    newEncounter.mobs.set("Maiden of Valor",
        new EncounterMob("Maiden of Valor", newEncounter.filePath+"maiden.jpg", true, 0));
    newEncounter.mobs.set("Containment Pylon",
        new EncounterMob("Containment Pylon", newEncounter.filePath+"obelisk.jpg", false));*/
    if(draw)
    {
        draw.sim.background.setDoubleMap(newEncounter.filePath+"tomb6.png",.717,433,-6689,null,
                                            newEncounter.filePath+"tomb7.png",.516,518,-6796,null);
    }
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        var fa = lookupActorByID(116939)[0];//fallen avatar
        if(!fa)
            return;
        var envir = actors[0];
        var p2StartTime = Number.MAX_VALUE;

        var unboundChaosTimes = [];
        unboundChaosTimes.spellIndex = null;
        var darkMarkTimes = [];
        darkMarkTimes.spellIndex = null;
        var shadowyBladesTimes = [];
        shadowyBladesTimes.spellIndex = null;
        var sbVoidZones = [];
        var collectCastTimes = function(time, array, spellIndex)
        {
            array.spellIndex = spellIndex;
            var existingTime = false;
            for(var arrayi = 0; arrayi < array.length; arrayi++)
            {
                if(Math.abs(time - array[arrayi]) < 1000)
                {
                    existingTime = true;
                    break;
                }
            }
            if(!existingTime)
            {
                array.push(time);
            }
        };
        var addEventsToTimeline = function(array)
        {
            if(array.length === 0 || array.spellIndex === null)
                return;
            for(var arrayi = 0; arrayi < array.length; arrayi++)
            {
                draw.timeline.addCast({time:array[arrayi], castLength:0, spellIndex:array.spellIndex});
            }
        }

        for(var ci = 0; ci < fa.casts.CA.length; ci++)
        {
            var cast = fa.casts.CA[ci];
            if(spells[cast.spellIndex].id === 235597)//annihilation(p2)
            {
                this.addPhase(2, "yellow", cast.time+cast.castLength);
                draw.sim.background.swapTime = cast.time+cast.castLength;
                p2StartTime = cast.time+cast.castLength;
            }
            else if(spells[cast.spellIndex].id === 239132)//rupture realities(p1)
            {
                draw.timeline.addCast(cast);
                draw.sim.lowerVisuals.addStates("rupture realities p1", cast.time, cast.castLength,
                    generateCircleGradientOnActor(120, "rgba(0,255,0, 0.6)", fa));
            }
            else if(spells[cast.spellIndex].id === 235572)//rupture realities(p2)
            {
                draw.timeline.addCast(cast);
                var loc = fa.getStateAtTime(cast.time);
                draw.sim.lowerVisuals.addStates("rupture realities p2 warning", cast.time, cast.castLength,
                    generateCircleOnLocation(42, "rgba(146, 178, 76, 0.5)",loc.x, loc.y));
                draw.sim.lowerVisuals.addStates("rupture realities p2", cast.time+cast.castLength, Number.MAX_VALUE,
                    generateCircleOnLocation(42, "rgb(146, 178, 76)",loc.x, loc.y));
            }
        }
        for(var di = 0; di < fa.damageDone.AA.length; di++)
        {
            var dmg = fa.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 236604)//shadowy blades
            {
                collectCastTimes(dmg.time, shadowyBladesTimes, dmg.spellIndex);
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                
                draw.sim.upperVisuals.addStates("dagger path", dmg.time-4000, 4000,
                    generateVectorBetweenActors(fa, actors[dmg.target], 5, "rgba(142, 39, 173, 0.6)"));
                sbVoidZones.push({loc: loc, time: dmg.time, size:'big'});
                
            }
        }
        for(var di = 0; di < envir.damageDone.AA.length; di++)
        {
            var dmg = envir.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 239058)//touch of sargeras
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                if(!loc)
                    continue;
                draw.sim.lowerVisuals.addStates("Touch of Sargeras circles", dmg.time-8000,8000,
                    generateCircleOnLocation(5, "rgb(0,150,0)", loc.x, loc.y));
            }
        }
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 242017 || spells[a.spellIndex].id === 236494)//black winds, desolate
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("black winds icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor), actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 234059)//unbound chaos
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            collectCastTimes(auraState.time, unboundChaosTimes, a.spellIndex);
                            for(var ei = 0; ei < 8; ei++)
                            {   
                                var eTime = auraState.time+(500*ei);
                                var loc = actor.getStateAtTime(eTime);
                                if(!loc || loc instanceof Death)
                                    continue;
                                draw.sim.lowerVisuals.addStates("unbound chaos explosion", eTime, 1500,
                                    generateCircleOnLocation(5, "rgba(0,255,0, 0.6)", loc.x, loc.y));
                            }
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 239739)//dark mark
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            collectCastTimes(auraState.time, darkMarkTimes, a.spellIndex);
                            draw.sim.lowerVisuals.addStates("dark mark range", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(8, "rgba(142, 39, 173, 0.6)", actor));
                            draw.sim.upperVisuals.addStates("dark mark icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 239212)//lingering darkness(blade voidzones)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {

                            var loc = actor.getStateAtTime(auraState.time);
                            sbVoidZones.push({loc:loc, time: auraState.time, size:'small'});
                            
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 241008)//cleansing protocol(maiden shield)
                {
                    var lastShield = 0;
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Maiden energy", lastShield, auraState.time-lastShield,
                                generateResCountOnActor(actor,3, "rgb(255,240,158)"), actor);
                            lastShield = auraState.endTime;
                            draw.sim.upperVisuals.addStates("cleansing protocol icon", auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
            });//foreach aura
        }//for actors

        draw.sim.actorVisuals.addStates("fallen avatar p1 energy", 0, p2StartTime,
            generateResCountOnActor(fa, 3, "rgb(255,240,158)"), fa);
        for(var sbvi = 0; sbvi < sbVoidZones.length; sbvi++)
        {
            var sb = sbVoidZones[sbvi];
            if(!sb.loc)
                continue;
            if(sb.size === 'big')
            {
                var bigDuration = 45000;
                if(sb.time+bigDuration > p2StartTime)
                    bigDuration = p2StartTime - sb.time;
                draw.sim.lowerVisuals.addStates("lingering darkness voidzone", sb.time, bigDuration,
                    generateCircleOnLocation(7, "rgb(142, 39, 173)", sb.loc.x, sb.loc.y));
            }
            else
            {
                var littleDuration = 5000;
                if(sb.time+littleDuration > p2StartTime)
                    littleDuration = p2StartTime - sb.time;
                draw.sim.lowerVisuals.addStates("lingering darkness voidzone", sb.time, littleDuration,
                                generateCircleOnLocation(3, "rgb(142, 39, 173)", sb.loc.x, sb.loc.y));
            }
        }
        addEventsToTimeline(darkMarkTimes);
        addEventsToTimeline(shadowyBladesTimes);
        addEventsToTimeline(unboundChaosTimes);
    };//newEncounter
};//initFallenAvatar()

//flaming orbs only deal Flaming Detonation(239267) damage
//demonic obelisks only deal Demonic Obelisk(239852) damage
function initKiljaeden(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/TombOfSargeras/Kiljaeden/";

    newEncounter.mobs.push(new EncounterMob("Kil'jaeden", newEncounter.filePath+"kiljaeden.jpg", true, 0, 117269));
    newEncounter.mobs.push(new EncounterMob("Erupting Reflection", newEncounter.filePath+"erupting reflection.jpg", false, null, 119206));
    newEncounter.mobs.push(new EncounterMob("Wailing Reflection", newEncounter.filePath+"wailing reflection.jpg", false, null, 119107));
    newEncounter.mobs.push(new EncounterMob("Shadowsoul", newEncounter.filePath+"voidwalker.jpg", false, null, 121193));
    newEncounter.mobs.push(new EncounterMob("Demonic Obelisk", null, false, null, 116939));
    newEncounter.mobs.push(new EncounterMob("Flaming Orb", null, false, null, 120082));
    /*newEncounter.mobs.set("Kil'jaeden",
        new EncounterMob("Kil'jaeden", newEncounter.filePath+"kiljaeden.jpg", true, 0));
    newEncounter.mobs.set("Shadowsoul",
        new EncounterMob("Shadowsoul", newEncounter.filePath+"voidwalker.jpg", false));
    newEncounter.mobs.set("Erupting Reflection",
        new EncounterMob("Erupting Reflection", newEncounter.filePath+"erupting reflection.jpg", false));
    newEncounter.mobs.set("Wailing Reflection",
        new EncounterMob("Wailing Reflection", newEncounter.filePath+"wailing reflection.jpg", false));
    newEncounter.mobs.set("Demonic Obelisk",
        new EncounterMob("Demonic Obelisk", null, false));
    newEncounter.mobs.set("Flaming Orb",
        new EncounterMob("Flaming Orb", null, false));*/
    if(draw)
    {
        draw.sim.setMap(newEncounter.filePath+"tomb8.png",0.652,1035,-4696);
        draw.sim.updateBounds = function(x,y)
        {
            
            if(x < this.xMin && x > 1300)
                this.xMin = x; 
            if(x > this.xMax && x < 1600)
                this.xMax = x;
            if(y < this.yMin&& y > -4650)
                this.yMin = y;
            if(y > this.yMax && y < -4350)
                this.yMax = y;
        };
    }
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(119206, 30000);//erupting reflection
        cd.addDamageWindow(119107);//wailing reflection
        cd.addDamageWindow(121193, 60000);//shadowsoul
    };
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        var burstingDF = new Image();
        burstingDF.src = this.filePath+"bursting dreadflame.jpg";
        var focusedDF = new Image();
        focusedDF.src = this.filePath+"focused dreadflame.jpg";
        var illidan = new Image();
        illidan.src = this.filePath+"illidan.jpg";
        var rift = new Image();
        rift.src = this.filePath+"rift.jpg";
        var illidanSpot = {};
        illidanSpot.x = 0;
        illidanSpot.y = 0;
        illidanSpot.count = 0;
        var rifts = [];



        var kj = lookupActorByID(117269)[0];//kiljaeden
        if(!kj)
            return;
        for(var ci = 0; ci < kj.casts.CA.length; ci++)
        {
            var cast = kj.casts.CA[ci];
            if(spells[cast.spellIndex].id === 238430)//bursting dreadflame
            {
                draw.sim.lowerVisuals.addStates("Bursting Dreadflame Range", cast.time, 5000,
                    generateCircleOnActor(15, "rgba(255,127,0, 0.5)", actors[cast.target]));
                draw.sim.upperVisuals.addStates("Bursting Dreadflame Icon", cast.time, 5000,
                    generateIconOnActor(burstingDF, actors[cast.target], cast.time, 5000));
            }
            else if(spells[cast.spellIndex].id === 238502)//focused dreadflame
            {
                draw.timeline.addCast(cast);
                draw.sim.lowerVisuals.addStates("Focused Dreadflame Line", cast.time, 5000,
                    generateVectorBetweenActors(kj, actors[cast.target],4, "rgba(255,127,0, 0.5)"));
                draw.sim.upperVisuals.addStates("Focused Dreadflame Icon", cast.time, 5000,
                    generateIconOnActor(focusedDF, actors[cast.target], cast.time, 5000));
            }
            else if(spells[cast.spellIndex].id === 239214)//tear rift
            {
                if(rifts.length !== 0)
                    rifts[rifts.length-1].endTime = cast.time;
                rifts.push({x:0, y:0, count:0, time:cast.time, endTime: Number.MAX_VALUE});
            }
            else if(spells[cast.spellIndex].id === 238429 ||//Bursting Dreadflame(one per set)
                spells[cast.spellIndex].id === 240910 || spells[cast.spellIndex].id === 238999)//armageddon, darkness of 1k souls
            {
                draw.timeline.addCast(cast);
            }
        }
        for(var di = 0; di < kj.damageDone.AA.length; di++)
        {
            var dmg = kj.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 238502 && (this.isHeroic() || this.isMythic()))//focused dreadflame - laser
            {
                draw.sim.lowerVisuals.addStates("Focused Dreadflame splash damage", dmg.time-5000, 5000,
                    generateCircleOnActor(5, "rgba(255,0,0,0.5)", actors[dmg.target]));
            }
            else if(spells[dmg.spellIndex].id === 239931)
            {
                draw.sim.lowerVisuals.addStates("Felclaws Cleave", dmg.time, 1000, 
                    generateConeBetweenActors(kj, actors[dmg.target], Math.PI/3, 9, "rgba(0,255,0,0.6)"));
            }
        }
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];

            var thisEncounter = this;
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 244834)//nether gale(intermission 1)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            thisEncounter.addPhase(2, "blue", auraState.time);
                            thisEncounter.addPhase(3, "yellow", auraState.endTime);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 241983)//deciever's veil(intermission 2)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            thisEncounter.addPhase(4, "purple", auraState.time);
                            thisEncounter.addPhase(5, "red", auraState.endTime);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 234310)//Armageddon Rain(small dot)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Aramgeddon Rain Dot", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)", false), actor);
                        }
                        if(auraState instanceof a.stateApplied || auraState instanceof a.stateStack)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            draw.sim.lowerVisuals.addStates("Small Armageddon", auraState.time-7000, 7000,
                                generateCircleOnLocation(3, "rgb(183,88,11)", loc.x, loc.y));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 240916)//Armageddon Hail(large dot)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.actorVisuals.addStates("Aramgeddon Hail Dot", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)", false), actor);
                        }
                        if(auraState instanceof a.stateApplied || auraState instanceof a.stateStack)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            draw.sim.lowerVisuals.addStates("Large Armageddon", auraState.time-7000, 7000,
                                generateCircleOnLocation(5, "rgb(183,88,11)", loc.x, loc.y));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 241721)//illidan's sightless gaze
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {   
                            var loc = actor.getStateAtTime(auraState.time);
                            illidanSpot.x += loc.x;
                            illidanSpot.y += loc.y;
                            illidanSpot.count++;
                            draw.sim.actorVisuals.addStates("illidan's sightless gaze", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(null, "rgba(0,255,0,0.4)", actor), actor);
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 239155)//gravity squeeze
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {   
                            draw.sim.actorVisuals.addStates("gravity suqeeze icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor), actor);
                        }
                        var loc = actor.getStateAtTime(auraState.time);
                        for(var ri = 0; ri < rifts.length; ri++)
                        {
                            if(auraState.time > rifts[ri].time && auraState.time < rifts[ri].endTime)
                            {
                                rifts[ri].x += loc.x;
                                rifts[ri].y += loc.y;
                                rifts[ri].count++;
                                break;
                            }
                        }
                    }
                }
            });
        }//for actors
        if(illidanSpot.count !== 0 && this.phases.length >= 4)
        {
            illidanSpot.x /= illidanSpot.count;
            illidanSpot.y /= illidanSpot.count;
            var endTime = (this.phases.length === 5)?this.phases[4].time:Number.MAX_VALUE;
            draw.sim.lowerVisuals.addStates("illidan location", this.phases[3].time, endTime-this.phases[3].time,
                generateIconOnLocation(illidan, illidanSpot.x, illidanSpot.y,null,null,2));
        }
        for(var ri = 0; ri < rifts.length; ri++)
        {
            if(rifts[ri].count === 0)
                continue;

            var centerX = 1511.2;
            var centerY = -4499.8;
            rifts[ri].x /= rifts[ri].count;
            rifts[ri].y /= rifts[ri].count;
            var dx = rifts[ri].x - centerX;
            var dy = rifts[ri].y - centerY;
            var dist = Math.sqrt(dx*dx + dy*dy);
            var moveLen = 40;
            var movedX = rifts[ri].x +(dx/dist*moveLen);
            var movedY = rifts[ri].y +(dy/dist*moveLen);
            draw.sim.upperVisuals.addStates("rift icon", rifts[ri].time, rifts[ri].endTime - rifts[ri].time,
                generateIconOnLocation(rift, movedX, movedY, null, null, 5));
            var turnOnDelay = 34000;
            draw.sim.lowerVisuals.addStates("rift range", rifts[ri].time+turnOnDelay, rifts[ri].endTime -rifts[ri].time-turnOnDelay,
                generateCircleOnLocation(moveLen, "rgba(0,255,0,0.4", movedX, movedY));
        }
    };//newEncounter
};//initKiljaeden()