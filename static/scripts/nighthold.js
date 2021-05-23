function initSkorpyron(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/Skorpyron/";

    newEncounter.mobs.push(new EncounterMob("Skorpyron", newEncounter.filePath+"skorpyron.jpg", true, 0, 102263));
    newEncounter.mobs.push(new EncounterMob("Acidmaw Scorpid", newEncounter.filePath+"green scorpid.jpg", false, null, 103225));
    newEncounter.mobs.push(new EncounterMob("Crystalline Scorpid", newEncounter.filePath+"blue scorpid.jpg", false, null, 103217));
    newEncounter.mobs.push(new EncounterMob("Volatile Scorpid", newEncounter.filePath+"red scorpid.jpg", false, null, 103224));
    /*newEncounter.mobs.set("Skorpyron",
        new EncounterMob("Skorpyron", newEncounter.filePath+"skorpyron.jpg", true, 0));
    newEncounter.mobs.set("Crystalline Scorpid",
        new EncounterMob("Crystalline Scorpid", newEncounter.filePath+"blue scorpid.jpg", false));
    newEncounter.mobs.set("Volatile Scorpid",
        new EncounterMob("Volatile Scorpid", newEncounter.filePath+"red scorpid.jpg", false));
    newEncounter.mobs.set("Acidmaw Scorpid",
        new EncounterMob("Acidmaw Scorpid", newEncounter.filePath+"green scorpid.jpg", false));
    newEncounter.mobs.set("Volatile Shard",
        new EncounterMob("Volatile Shard", "/icons/encounters/null.png", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"1.png", 1.246, -3829, -612);

    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        var envir = actors[0];
        for(var di = 0; di < envir.damageDone.AA.length; di++)
        {
            var dmg = envir.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 204744)//toxic chitin
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                draw.sim.lowerVisuals.addStates("toxic chitin pool",
                    dmg.time, 20000,
                    generateCircleOnLocation(1, "RGB(0,255,0)", loc.x, loc.y));
            }
        }
        /*var volatile = lookupActorByID("Volatile Shard");
        for(var vi = 0; vi < volatile.length; vi++)
        {
            var v = volatile[vi];
            for(var ci = 0; ci < v.casts.CA.length; ci++)
            {
                var cast = v.casts.CA[ci];
                if(spells[cast.spellIndex].id === 226229)//volatille resonance
                {
                    var loc = v.getStateAtTime(cast.time);
                    draw.sim.lowerVisuals.addStates("red shard explosion", cast.time, cast.castLength,
                        generateCircleOnLocation(15, "rgba(255,0,0,0.5)", loc.x, loc.y));
                }
            }
        }*/
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.name === "Skorpyron")
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 204275)//arcanoslash
                    {
                        var target = actors[actor.getTargetAtTime(cast.time)];
                        draw.sim.lowerVisuals.addStates("arcanoslash arc", cast.time+cast.castLength, 250,
                            generateConeBetweenActors(actor, target, Math.PI*0.6, 18, "rgba(150,0,255,0.5)"));       
                    }
                    else if(spells[cast.spellIndex].id === 204471 ||//focused blast
                        spells[cast.spellIndex].id ===  204316)// shockwave
                    {
                        draw.timeline.addCast(cast);
                    }
                }
                for(var di = 0; di < actor.damageDone.AA.length; di++)
                {
                    var dmg = actor.damageDone.AA[di];
                    var target = actors[dmg.target];
                    if(spells[dmg.spellIndex].id === 210074)//shockwave
                    {
                        for(var dTime = 0; dTime <= 1500; dTime += 100)
                        {
                            var loc = target.getStateAtTime(dmg.time + dTime);
                            var dx = loc.x + 3443.2;
                            var dy = loc.y + 89.59;
                            var dist = Math.sqrt(dx*dx + dy*dy);
                            if(dist > 31.7)
                            {
                                draw.sim.upperVisuals.addStates("shockwave line", dmg.time-550, 1700,
                                    generateLineBetweenActors(actor, target, "rgb(168, 99, 58)", 5, null, null, true));
                                break;
                            }
                        }
                    }//if shockwave
                    else if(spells[dmg.spellIndex].id === 204483)//focused blast
                    {
                        draw.sim.lowerVisuals.addStates("focused Blast", dmg.time, 1000,
                            generateVectorBetweenActors(actor, target, 2, "rgba(130, 173, 255, 0.6)"));
                    }
                }
                var thisHelper = this;
                actor.auras.AM.forEach(function(a){
                    
                    if(spells[a.spellIndex].id === 204459)//exoskeletal vulnerability
                    {
                        for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                        {
                            var auraState = a.AA[auraStateIndex];
                            if(auraState instanceof a.stateApplied)
                            {
                                thisHelper.addPhase(2,"yellow", auraState.time);
                            }
                            else if(auraState instanceof a.stateRemoved)
                            {
                                thisHelper.addPhase(1,"green", auraState.time);
                            }
                        }
                    }//if exoskeletal vulnerability
                });//foreach Aura
            }//if skorpyron

            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 204766)//energy surge
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Energy Surge icon", auraState.time, auraState.endTime - auraState.time, 
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)",false));
                        }
                    }
                }//if energy surge
            });
        }//for actors
    };//setupVisuals()
};//initSkprpyron()

function initChronomaticAnomaly(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/ChronomaticAnomaly/";

    newEncounter.mobs.push(new EncounterMob("Chronomatic Anomaly", newEncounter.filePath+"chronomaticAnomaly.jpg", true, 0, 104415));
    newEncounter.mobs.push(new EncounterMob("Waning Time Particle", newEncounter.filePath+"pink ele.jpg", false, null, 104676));
    newEncounter.mobs.push(new EncounterMob("Fragmented Time Particle", newEncounter.filePath+"pink ele.jpg", false, null, 114671));
    
    /*newEncounter.mobs.set("Chronomatic Anomaly",
        new EncounterMob("Chronomatic Anomaly", newEncounter.filePath+"chronomaticAnomaly.jpg", true, 0));
    newEncounter.mobs.set("Fragmented Time Particle",
        new EncounterMob("Fragmented Time Particle", newEncounter.filePath+"pink ele.jpg", false));
    newEncounter.mobs.set("Waning Time Particle",
        new EncounterMob("Waning Time Particle", newEncounter.filePath+"pink ele.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"1.png", 1.658, -4051, -735);

    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(104676);//waining time particle
        cd.addDamageWindow(114671);//fragmented time particle
    };
    
    newEncounter.setupVisuals = function()
    {
        this.addGroupSpawnToTimeline(104676);//waining time particle
        this.addPhase(1, "green", 0);
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            var thisHelper = this;
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 206617)//time bomb
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Time bomb icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("Time Bomb Warning", auraState.endTime - 3000, 3000,
                                generateCircleOnActor(15, "rgba(255,0,0,0.4)", actor));
                        }
                    }
                }//if time bomb
                else if(spells[a.spellIndex].id === 206607)//chronometric particles
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("tank debuff", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                        }
                    }
                }//chronometric particles
                else if(spells[a.spellIndex].id === 219823)//power overwhelming
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("PO stacks", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                            thisHelper.addPhase(2, "yellow", auraState.time);
                        }
                        else if(auraState instanceof a.stateRemoved)
                        {
                            thisHelper.addPhase(1, "green", auraState.time);
                        }
                    }
                }//chronometric particles
            });//forEach aura
        }//for actors
    }//setupVisuals()
};//initChronomaticAnomaly()

function initTrilliax(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/Trilliax/";
    newEncounter.mobs.push(new EncounterMob("Trilliax", newEncounter.filePath+"trilliax.jpg", true, 0, 104288));
    newEncounter.mobs.push(new EncounterMob("Scrubber", newEncounter.filePath+"scrubberBlue.jpg", false, null, 104596));
    newEncounter.mobs.push(new EncounterMob("Trilliax's Imprint", newEncounter.filePath+"trilliax.jpg", false, null, 108303));//first m add
    newEncounter.mobs.push(new EncounterMob("Trilliax's Imprint", newEncounter.filePath+"trilliax.jpg", false, null, 108144));//second m add

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"1.png", 1.148, -3786, -608);
    
    if(newEncounter.isMythic())
    {
        newEncounter.setupCombatData = function(cd)
        {
            cd.addDamageWindow(108303);//both imprints
            cd.addDamageWindow(108144);
        };
    }
    newEncounter.setupVisuals = function()
    {
        var cake = new Image();
        cake.src = newEncounter.filePath+"cake.jpg";
        var feast = new Image();
        feast.src = newEncounter.filePath+"feast.jpg";

        this.addGroupSpawnToTimeline(108303);//both trilliax imprint adds
        this.addGroupSpawnToTimeline(108144);

        var trilliax = lookupActorByID(104288)[0];//trilliax
        if(!trilliax)   
            return;
        var cakeTimes = [];
        var feastTimes = [];
        var annihilationTimes = [];
        this.addPhase(1, "green", 0);
        for(var ci = 0; ci < trilliax.casts.CA.length; ci++)
        {
            var cast = trilliax.casts.CA[ci];
            if(spells[cast.spellIndex].id === 206788)//toxic slice
            {
                draw.timeline.addCast(cast);
                cakeTimes.push(cast.time + cast.castLength);
            }
            else if(spells[cast.spellIndex].id === 207502)//succulent feast
            {
                draw.timeline.addCast(cast);
                feastTimes.push(cast.time + cast.castLength);
            }
            else if(spells[cast.spellIndex].id === 207630)//annihilation
            {
                draw.timeline.addCast(cast);
            }
            else if(spells[cast.spellIndex].id === 206557)//the maniac
            {
                this.addPhase(2, "yellow", cast.time);
            }
            else if(spells[cast.spellIndex].id === 206559)//the caretaker
            {
                this.addPhase(3, "red", cast.time);
            }
            else if(spells[cast.spellIndex].id === 206560)//the cleaner
            {
                this.addPhase(1, "green", cast.time);
            }
            else if(spells[cast.spellIndex].id === 206641)//arcane slash
            {
                draw.sim.lowerVisuals.addStates("arcane slash cone", cast.time, cast.castLength,
                    generateConeBetweenActors(trilliax, actors[cast.target], Math.PI/5.5, 12, "rgba(189,7,255, 0.6)"));
            }
        }//trilliax casts
        var imprints = lookupActorByID(108303).concat(lookupActorByID(108144));//both m adds
        for(var imprintI = 0; imprintI < imprints.length; imprintI++)
        {
            var actor = imprints[imprintI];
            for(var ci = 0; ci < actor.casts.CA.length; ci++)
            {
                var cast = actor.casts.CA[ci];
                if(spells[cast.spellIndex].id === 215062)//toxic slice
                {
                    draw.timeline.addCast(cast);
                    cakeTimes.push(cast.time + cast.castLength);
                }
            }
            actor.auras.AM.forEach(function(a){
                if(spells[a.spellIndex].id === 214670)//energized
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("energized icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
            });
        }
        for(var di = 0; di < actors[0].damageDone.AA.length; di++)
        {
            var dmg = actors[0].damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 206488)//arcane seepage
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                draw.sim.lowerVisuals.addStates("arcane seepage pool", dmg.time, 20000,
                    generateCircleOnLocation(2, "rgba(189,7,255, 0.6)", loc.x, loc.y));
            }
        }
        cakeTimes.push(Number.MAX_VALUE);//going to look for the 2nd to last cast, padding the end
        feastTimes.push(Number.MAX_VALUE);

        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 206798)//toxic slice
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            for(var cakeI = 0; cakeI < cakeTimes.length; cakeI++)
                            {
                                if(auraState.time < cakeTimes[cakeI])
                                {
                                    var loc = actor.getStateAtTime(auraState.time);
                                    draw.sim.upperVisuals.addStates("cake icon", cakeTimes[cakeI-1], auraState.time - cakeTimes[cakeI-1],
                                        generateIconOnLocation(cake, loc.x, loc.y));
                                    draw.sim.upperVisuals.addStates("toxic slice debuff", auraState.time, auraState.endTime - auraState.time,
                                        generateAuraIconOnActor(a, actor));
                                    break;
                                }
                            }
                        }
                    }
                }//if toxic slice
                else if(spells[a.spellIndex].id === 206838)//succulent feast
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            for(var feastI = 0; feastI < feastTimes.length; feastI++)
                            {
                                if(auraState.time < feastTimes[feastI])
                                {
                                    var loc = actor.getStateAtTime(auraState.time);
                                    draw.sim.upperVisuals.addStates("feast icon", feastTimes[feastI-1], auraState.time - feastTimes[feastI-1],
                                        generateIconOnLocation(feast, loc.x, loc.y));
                                    draw.sim.upperVisuals.addStates("feast buff", auraState.time, auraState.endTime - auraState.time,
                                        generateAuraIconOnActor(a, actor));
                                    break;
                                }
                            }
                        }
                    }
                }//if succulent feast
                else if(spells[a.spellIndex].id === 214573 ||//stuffed
                    spells[a.spellIndex].id === 208915 || spells[a.spellIndex].id === 208910)//arcing bonds A & B
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("stuffed/bonds debuff", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            if(spells[a.spellIndex].id === 208910)//bonds B, the one that does dmg to both targets
                            {
                                var di = actor.damageDone.AA.binarySearch(auraState.time);
                                var dmg = actor.damageDone.AA[di];
                                if(!dmg)
                                    continue;

                                while(dmg !== undefined && dmg.time < auraState.endTime)
                                {
                                    if(spells[dmg.spellIndex].id === 208918)
                                    {
                                        draw.sim.upperVisuals.addStates("arcing bonds dmg", dmg.time, 700,
                                            generateLineBetweenActors(actor, actors[dmg.target], "rgb(255,0,0)", 4, null, null, true));
                                    }
                                    dmg = actor.damageDone.AA[++di];
                                }
                            }
                        }
                    }
                }//if misc debuffs`
                else if(spells[a.spellIndex].id === 206641)//arcane slash
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("arcane slash", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                        }
                    }
                }//if arcane slash
                else if(spells[a.spellIndex].id === 208499)//sterilize
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("sterilize debuff", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("sterilize range", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(6, "rgba(0,0,255,0.5)", actor));
                        }
                    }
                }//if sterilize
                /*else if(spells[a.spellIndex].id === 207631)//annihilation
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {

                            var di = actor.damageDone.AA.binarySearch(auraState.time-1000);
                            var dmg = actor.damageDone.AA[di];
                            while(dmg && dmg.time < auraState.endTime+100)
                            {
                                if(spells[dmg.spellIndex].id === 207631)
                                {
                                    draw.sim.lowerVisuals.addStates("annihilation laser", auraState.time, 1000,
                                        generateVectorBetweenActors(trilliax, actor, 2, "rgba(189,7,255, 0.6)"));
                                }
                                dmg = actor.damageDone.AA[++di];
                            }
                        }
                    }
            }*/
            });//foreach aura
        }//for actors
    };//setupVisuals()
};//initTrilliax

function initAluriel(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/Aluriel/";

    newEncounter.mobs.push(new EncounterMob("Spellblade Aluriel", newEncounter.filePath+"aluriel.jpg", true, 0, 104881));
    newEncounter.mobs.push(new EncounterMob("Fel Soul", newEncounter.filePath+"felSoul.jpg", false, null, 115905));
    newEncounter.mobs.push(new EncounterMob("Icy Enchantment", newEncounter.filePath+"frost ele.jpg", false, null, 107237));
    newEncounter.mobs.push(new EncounterMob("Fiery Enchantment", newEncounter.filePath+"fire ele.jpg", false, null, 107285));
    newEncounter.mobs.push(new EncounterMob("Arcane Enchantment", newEncounter.filePath+"pink ele.jpg", false, null, 107287));
    newEncounter.mobs.push(new EncounterMob("Spellblade Aluriel", newEncounter.filePath+"aluriel.jpg", false, null, 107980));//casts random spells
    /*newEncounter.mobs.set("Spellblade Aluriel",
        new EncounterMob("Spellblade Aluriel", newEncounter.filePath+"aluriel.jpg", true, 0));
    newEncounter.mobs.set("Icy Enchantment",
        new EncounterMob("Icy Enchantment", newEncounter.filePath+"frost ele.jpg", false));    
    newEncounter.mobs.set("Fiery Enchantment",
        new EncounterMob("Fiery Enchantment", newEncounter.filePath+"fire ele.jpg", false)); 
    newEncounter.mobs.set("Arcane Enchantment",
        new EncounterMob("Arcane Enchantment", newEncounter.filePath+"pink ele.jpg", false));   
    newEncounter.mobs.set("Ice Shards",
        new EncounterMob("Ice Shards", newEncounter.filePath+"ice block.jpg", false)); 
    newEncounter.mobs.set("Fel Soul",
        new EncounterMob("Fel Soul", newEncounter.filePath+"felSoul.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"3.png", .985, -3602, -624);

    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(107237);//icy enhancement
        cd.addDamageWindow(107285);//fiery enchantment
        cd.addDamageWindow(107287);//arcane enchantment
    };
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "blue", 0);
        var boss = lookupActorByID(104881)[0];//main spellblade
        if(!boss)
            return;
        var frostPatches = [];
        var firePatches = [];


        for(var ci = 0; ci < boss.casts.CA.length; ci++)
        {
            var cast = boss.casts.CA[ci];
            if(spells[cast.spellIndex].id === 213864)//icy Enchantment
            {
                this.addPhase(1, "blue", cast.time);
            }
            else if(spells[cast.spellIndex].id === 213867)//fiery Enchantment
            {
                this.addPhase(2, "red", cast.time);
            }
            else if(spells[cast.spellIndex].id === 213869)//fiery Enchantment
            {
                this.addPhase(3, "purple", cast.time);
            }
            else if(spells[cast.spellIndex].id === 215458)//annihilated
            {
                draw.timeline.addCast(cast);
                draw.sim.lowerVisuals.addStates("tank cone",
                    cast.time, 4000,
                    generateConeBetweenActors(boss, actors[cast.target], Math.PI/5, 8, "rgba(209, 209, 209, 0.8)"));
            }
            else if(spells[cast.spellIndex].id === 212735)//detonate mark of frost
            {
                frostPatches.push({time:cast.time+cast.castLength, duration:Number.MAX_VALUE});
            }
            else if(spells[cast.spellIndex].id === 213853)//animate mark of frost
            {
                frostPatches[frostPatches.length-1].duration = cast.time - frostPatches[frostPatches.length-1].time;
            }
            else if(spells[cast.spellIndex].id === 213275)//detonate searing brand
            {
                firePatches.push({time:cast.time+cast.castLength, duration:Number.MAX_VALUE});
            }
            else if(spells[cast.spellIndex].id === 213567)//animate searing brand
            {
                firePatches[firePatches.length-1].duration = cast.time+cast.castLength - firePatches[firePatches.length-1].time;
            }
        }

        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.name === "Arcane Enchantment")
            {
                if(actor.states.SA <= 2)
                    break;
                var state = actor.states.SA[0];
                draw.sim.lowerVisuals.addStates("arcane voidzone", state.time -10000, 10000,
                    generateCircleOnLocation(6,"rgb(248, 127, 255)", state.x, state.y ));
            }
            else if(actor.name === "Icy Enchantment")
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 213083)//frozen tempest
                    {
                        var startTime = cast.time + cast.castLength;
                        var endTime = startTime + 15000;
                        var lastState = actor.states.SA[actor.states.SA.length-1];
                        if(lastState.time < endTime)
                            endTime = lastState.time;
                        draw.sim.lowerVisuals.addStates("frozen temptest range", startTime, endTime-startTime,
                            generateCircleOnActor(15, "rgb(0,0,255)", actor));
                    }
                }
            }
            else if(actor.name === "Fel Soul")
            {
                removeDowntime(actor);
            }
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 215458 || spells[a.spellIndex].id === 212647)//annihilated frotbitten
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff w/ stacks",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 213148  //searing brand warning
                    || spells[a.spellIndex].id === 212531)// mark of frost warning
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
                else if( spells[a.spellIndex].id === 213166) //searing brand dot
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("searing brand icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            for(var patchesI = 0; patchesI < firePatches.length; patchesI++)
                            {
                                if(auraState.time < firePatches[patchesI].time && auraState.endTime > firePatches[patchesI].time)
                                {
                                    var loc = actor.getStateAtTime(firePatches[patchesI].time);
                                    draw.sim.lowerVisuals.addStates("fire patch",
                                        firePatches[patchesI].time, firePatches[patchesI].duration,
                                        generateCircleOnLocation(6, "rgb(255, 0, 0)", loc.x, loc.y));
                                }
                            }
                        }
                    }
                }//searing brand dot
                else if(spells[a.spellIndex].id === 212587) //mark of frost
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("mark of frost icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("mark of frost range",
                                auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(8, "rgba(0,0,255,0.5)", actor));
                            for(var patchesI = 0; patchesI < frostPatches.length; patchesI++)
                            {
                                if(auraState.time < frostPatches[patchesI].time && auraState.endTime > frostPatches[patchesI].time)
                                {
                                    var loc = actor.getStateAtTime(frostPatches[patchesI].time);
                                    draw.sim.lowerVisuals.addStates("frost patch",
                                        frostPatches[patchesI].time, frostPatches[patchesI].duration,
                                        generateCircleOnLocation(6, "rgb(0, 216, 255)", loc.x, loc.y));
                                }
                            }
                        }
                    }
                }//if mark of frost
            });//foreach aura
        }//for actors
    };//setupVisuals
};//initAluriel

function initKrosus(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/Krosus/";

    newEncounter.mobs.push(new EncounterMob("Krosus", newEncounter.filePath+"krosus.jpg", true, 0, 101002));
    newEncounter.mobs.push(new EncounterMob("Burning Ember", newEncounter.filePath+"fel ele.jpg", false, null, 104262));
    newEncounter.mobs.push(new EncounterMob("Krosus", newEncounter.filePath+"krosus.jpg", false, null, 103725));
    /*newEncounter.mobs.set("Krosus",
        new EncounterMob("Krosus", newEncounter.filePath+"krosus.jpg", true, 0));
    newEncounter.mobs.set("Burning Ember",
        new EncounterMob("Burning Ember", newEncounter.filePath+"fel ele.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"3.png", 1,-3516, -515);
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(104262, 30000);//burning ember
    };
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        var slamCount = 0;
        var pitchTimes = [];
        var krosus = lookupActorByID(101002).concat(lookupActorByID(103725));//main boss + other casters
        for(var bossI = 0; bossI < krosus.length; bossI++)
        {
            var boss = krosus[bossI];
            for(var ci = 0; ci < boss.casts.CA.length; ci++)
            {
                var cast = boss.casts.CA[ci];
                if(spells[cast.spellIndex].id === 205862)//slam
                {
                    draw.timeline.addCast(cast);
                    slamCount++;
                    if(slamCount === 3)
                        this.addPhase(2, "yellow", cast.time+cast.castLength);
                    else if(slamCount === 6)
                        this.addPhase(3, "red", cast.time+cast.castLength);
                    else if(slamCount === 9)
                        this.addPhase(4, "purple", cast.time+cast.castLength);
            
                }
                else if(spells[cast.spellIndex].id === 205370)//fel beam cast
                {
                    draw.timeline.addCast(cast);
                }
                else if(spells[cast.spellIndex].id === 205361)//orb of destruction
                {
                    draw.timeline.addCast(cast);
                }
                else if(spells[cast.spellIndex].id === 205420)//burning pitch
                {
                    draw.timeline.addCast(cast);
                    pitchTimes.push(cast.time);
                }
            }
            for(var di = 0; di < boss.damageDone.AA.length; di++)
            {
                var dmg = boss.damageDone.AA[di];

                if(spells[dmg.spellIndex].id === 205391)//fel beam dmg
                {
                    draw.sim.lowerVisuals.addStates("fel beam line", dmg.time-500, 1000,
                        generateLineBetweenActors(krosus[0], actors[dmg.target], "rgb(0,255,0)", 4, null, null, true));
                }
                else if(spells[dmg.spellIndex].id === 206376)//burning pitch
                {
                    for(var pitchI = 0; pitchI < pitchTimes.length; pitchI++)
                    {
                        var pt = pitchTimes[pitchI];
                        if(Math.abs(dmg.time - pt) < 10000)
                        {
                            var loc = actors[dmg.target].getStateAtTime(dmg.time);
                            draw.sim.lowerVisuals.addStates("Burning pitch warning", pt, dmg.time - pt, 
                                generateCircleOnLocation(2, "rgb(0,255,0)", loc.x, loc.y));
                        }
                    }
                }
            }
        }//for bosses
        for(var actorI = 0; actorI < actors.length; actorI++)
        {
            var actor = actors[actorI];
            if(actor.name === "Burning Ember")
            {
                for(var pitchI = 0; pitchI < pitchTimes.length; pitchI++)
                {
                    var pt = pitchTimes[pitchI];
                    if(Math.abs(actor.states.SA[0].time - pt) < 20000)
                    {
                        draw.sim.lowerVisuals.addStates("Burning pitch warning", pt, actor.states.SA[0].time - pt, 
                            generateCircleOnLocation(2, "rgb(255,0,0)", actor.states.SA[0].x, actor.states.SA[0].y));
                    }
                }
            }
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 205344)//Orb of Destruction
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("orb of destruction icon",  
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("orb range",
                                auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(20, "rgba(0,255,0,0.5)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 206677)//Searing brand
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("searing brand icon",  
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                        }
                    }
                }
            });//foreach Aura
        }//for actors
    };//setupVisuals()
};//initKrosus()

function initTichondrius(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/Tichondrius/";
    newEncounter.mobs.push(new EncounterMob("Tichondrius", newEncounter.filePath+"tichondrius.jpg", true, 0, 103685));
    newEncounter.mobs.push(new EncounterMob("Tainted Blood", newEncounter.filePath+"RedBlood.jpg", false, null, 108934));
    newEncounter.mobs.push(new EncounterMob("Fel Spire", newEncounter.filePath+"felSpire.jpg", false, null, 108625));
    newEncounter.mobs.push(new EncounterMob("Phantasmal Bloodfang", newEncounter.filePath+"bat.jpg", false, null, 104326));
    newEncounter.mobs.push(new EncounterMob("Felsworn Spellguard", newEncounter.filePath+"felsworn.jpg", false, null, 108591));
    newEncounter.mobs.push(new EncounterMob("Sightless Watcher", newEncounter.filePath+"tall robes.jpg", false, null, 108593));
    newEncounter.mobs.push(new EncounterMob("Carrion Nightmare", newEncounter.filePath+"tichondrius.jpg", false, null, 108739));//casts p2 lasers
    /*newEncounter.mobs.set("Tichondrius",
        new EncounterMob("Tichondrius", newEncounter.filePath+"tichondrius.jpg", true, 0));
    newEncounter.mobs.set("Tainted Blood",
        new EncounterMob("Tainted Blood", newEncounter.filePath+"RedBlood.jpg", false));
    newEncounter.mobs.set("Fel Spire",
        new EncounterMob("Fel Spire", newEncounter.filePath+"felSpire.jpg", false));
    newEncounter.mobs.set("Phantasmal Bloodfang",
        new EncounterMob("Phantasmal Bloodfang", newEncounter.filePath+"bat.jpg", false));
    newEncounter.mobs.set("Felsworn Spellguard",
        new EncounterMob("Felsworn Spellguard", newEncounter.filePath+"felsworn.jpg", false));
    newEncounter.mobs.set("Sightless Watcher",
        new EncounterMob("Sightless Watcher", newEncounter.filePath+"tall robes.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"5.png", 0.338, -3507, -372);

    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        var seekerSwarmTimes = [];
        var tich = lookupActorByID(103685)[0];
        if(!tich)
            return;
        for(var di = 0; di < tich.damageDone.AA.length; di++)
        {
            var dmg = tich.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 213534)//echoes of the void
            {
                draw.sim.upperVisuals.addStates("echoes dmg", dmg.time, 500,
                    generateLineBetweenActors(tich, actors[dmg.target], "rgb(132, 0, 209)", 4, null, null, true));
            }
        }
        for(var ci = 0; ci < tich.casts.CA.length; ci++)
        {
            var cast = tich.casts.CA[ci];
            if(spells[cast.spellIndex].id === 213238) //seeker swarm
            {
                seekerSwarmTimes.push(cast.time);
                draw.timeline.addCast(cast);
            }
            else if(spells[cast.spellIndex].id === 213531)//echoes of the void
            {
                draw.timeline.addCast(cast);
            }
            else if(spells[cast.spellIndex].id === 206311)//illusory Night(p2)
            {
                var p2Start = cast.time+cast.castLength;
                this.addPhase(2, "yellow", p2Start);
                this.addPhase(1, "green", p2Start+30000);
            }
        }

        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 206480)//carrion plague
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("carrion plague icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            for(var ssti = 0; ssti < seekerSwarmTimes.length; ssti++)
                            {
                                var sstt = seekerSwarmTimes[ssti];
                                if(sstt > auraState.time && sstt < auraState.endTime)
                                {
                                    draw.sim.lowerVisuals.addStates("seeker swarm vector", sstt, 2000,
                                        generateVectorBetweenActors(tich, actor, 2.5, "rgba(0, 175, 20, 0.6)"));
                                }
                            }
                        }
                    }
                }//if carrion plague
                else if(spells[a.spellIndex].id === 206466 || spells[a.spellIndex].id === 216040//essence of night, burning soul
                    || spells[a.spellIndex].id === 215988 || spells[a.spellIndex].id ===  208230//carrion nightmare, feast of blood
                    || spells[a.spellIndex].id === 206893)//vampiric aura
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff icons", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }//if debuffs
                else if(spells[a.spellIndex].id === 212794)//brand of argus
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("brand of argus range", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(5, "rgba(0,255,0,0.6)", actor));
                        }
                    }
                }//if brand of argus
                else if(spells[a.spellIndex].id === 216024)//volatile wound
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("volatile wound debuff", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                        }
                        else if(auraState instanceof a.stateRemoved)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            draw.sim.lowerVisuals.addStates("volatile wound voidzone", auraState.time, 30000,
                                generateCircleOnLocation(3, "rgb(246, 147, 255)", loc.x, loc.y))
                        }
                    }
                }//if volatile wound
            });//foreach aura
        }//for actors
    };//setupVisuals()
};//initTichondrius()

function initTelarn(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/Telarn/";
    newEncounter.mobs.push(new EncounterMob("Naturalist Tel'arn", newEncounter.filePath+"botanist.jpg", true, 0, 109041));
    newEncounter.mobs.push(new EncounterMob("Arcanist Tel'arn", newEncounter.filePath+"arcanist.jpg", true, 0, 109040));
    newEncounter.mobs.push(new EncounterMob("Solarist Tel'arn", newEncounter.filePath+"solarist.jpg", true, 0, 109038));
    newEncounter.mobs.push(new EncounterMob("Parasitic Lasher", newEncounter.filePath+"lasher.jpg", false, null, 109075));
    newEncounter.mobs.push(new EncounterMob("Plasma Sphere", newEncounter.filePath+"fire orb.jpg", false, null, 109804));
    newEncounter.mobs.push(new EncounterMob("Toxic Spore", newEncounter.filePath+"spore.jpg", false, null, 110125));
    /*newEncounter.mobs.set("Arcanist Tel'arn", 
        new EncounterMob("Arcanist Tel'arn", newEncounter.filePath+"arcanist.jpg", true));
    newEncounter.mobs.set("Naturalist Tel'arn", 
        new EncounterMob("Naturalist Tel'arn", newEncounter.filePath+"botanist.jpg", true));
    newEncounter.mobs.set("Solarist Tel'arn", 
        new EncounterMob("Solarist Tel'arn", newEncounter.filePath+"solarist.jpg", true));
    newEncounter.mobs.set("High Botanist Tel'arn", 
        new EncounterMob("High Botanist Tel'arn", newEncounter.filePath+"arcanist.jpg", true));
    newEncounter.mobs.set("Parasitic Lasher",
        new EncounterMob("Parasitic Lasher", newEncounter.filePath+"lasher.jpg",false));
    newEncounter.mobs.set("Plasma Sphere",
        new EncounterMob("Plasma Sphere", newEncounter.filePath+"fire orb.jpg",false));
    newEncounter.mobs.set("Toxic Spore",
        new EncounterMob("Toxic Spore", newEncounter.filePath+"spore.jpg",false));*/
    newEncounter.mobsToIgnore = ["Conotrolled Chaos Stalker"];
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"4.png", 0.75, -3227, -875);

    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(109804);//plasma sphere
        cd.addDamageWindow(109075);//paracitic lasher
    };
    newEncounter.setupVisuals = function()
    {
        var sporeIcon = new Image();
        sporeIcon.src = this.filePath+"spore.jpg";
        //high botanist appears in the logs and does nothing, remove if present
        /*var highBotanists = lookupActor//("High Botanist Tel'arn");
        for(var bossI = 0; bossI < highBotanists.length; bossI++)
        {
            var boss = highBotanists[bossI];
            if(boss.states.SA.length <= 2)
                boss.class.isImportant = false;
        }*/
        this.addPhase(1, "green", 0);

        var solarist = lookupActorByID(109038)[0];//solarist
        var summonSphereTimes = [];
        if(solarist)
        {
            this.addPhase(2, "yellow", solarist.states.SA[0].time);
            for(var castI = 0; castI < solarist.casts.CA.length; castI++)
            {
                var cast = solarist.casts.CA[castI];
                if(spells[cast.spellIndex].id === 218774)//summon plasma sphere
                {
                    summonSphereTimes.push(cast.time+cast.castLength);
                    draw.timeline.addCast(cast);
                }
            }
        }
        summonSphereTimes.push(Number.MAX_VALUE);

        var spheres = lookupActorByID(109804);//plasma spheres
        for(var sphereI = 0; sphereI < spheres.length; sphereI++)
        {
            var sphereState = spheres[sphereI].states.SA[0];
            for(var timeI = 0; timeI < summonSphereTimes.length-1; timeI++)
            {
                if(sphereState.time > summonSphereTimes[timeI] && sphereState.time < summonSphereTimes[timeI+1])
                {   
                    sphereState.time = summonSphereTimes[timeI];
                    break;
                }
            }
        }


        var naturalist = lookupActorByID(109041)[0];//naturalist
        if(naturalist)
        {
            this.addPhase(3, "red", naturalist.states.SA[0].time);
            for(var castI = 0; castI < naturalist.casts.CA.length; castI++)
            {
                var cast = naturalist.casts.CA[castI];
                if(spells[cast.spellIndex].id === 218927)//grace of nature
                {
                    var loc = naturalist.getStateAtTime(cast.time+cast.castLength);
                    draw.sim.lowerVisuals.addStates("grace of nature spot", cast.time+cast.castLength, Number.MAX_VALUE,
                        generateCircleOnLocation(5, "rgba(0,255,0,0.5)", loc.x, loc.y));
                }
            }
        }

        for(var actorI = 0; actorI < actors.length; actorI++)
        {
            var actor = actors[actorI];
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 218342)//lasher fixate
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("lasher fixate",
                                auraState.time, auraState.endTime - auraState.time,
                                generateLineBetweenActors(actor, actors[a.source], "rgb(255,0,0)", 3, null, null, true));
                        }
                    }
                }//lasher fixate
                else if(spells[a.spellIndex].id === 218304)//parasitic fetter
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }//parasitic fetter
                else if(spells[a.spellIndex].id === 218809)//call of night
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("call of night range",
                                auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(5, "rgba(157, 0, 188, 0.6)", actor));
                        }
                    }
                }//call of night
                else if(spells[a.spellIndex].id === 218503)//recursive strikes
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("recursive strikes icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 219235)//toxic spores
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("toxic spores dot icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(0,255,0)"));
                        }
                        if(auraState instanceof a.stateApplied || auraState instanceof a.stateStack)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            draw.sim.upperVisuals.addStates("spore location",
                                auraState.time-5000, 5000,
                                generateIconOnLocation(sporeIcon, loc.x, loc.y));
                        }
                    }
                }
            });//foreach aura
        }//for actors
    };//setupVisuals()
};//initTelarn()

function initEtraeus(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/Etraeus/";

    newEncounter.mobs.push(new EncounterMob("Star Augur Etraeus", newEncounter.filePath+"etraeus.jpg", true, 0, 103758));
    newEncounter.mobs.push(new EncounterMob("Coronal Ejection", "/icons/encounters/null.png", false, null, 103790));
    newEncounter.mobs.push(new EncounterMob("Ice Crystal", newEncounter.filePath+"ice crystal.jpg", false, null, 109003));
    newEncounter.mobs.push(new EncounterMob("Voidling", newEncounter.filePath+"void add 3.jpg", false, null, 104688));
    newEncounter.mobs.push(new EncounterMob("Eye of the Void", newEncounter.filePath+"eyeball.jpg", false, null, 109082));
    newEncounter.mobs.push(new EncounterMob("Remnant of the Void", newEncounter.filePath+"eyeball.jpg", false, null, 109151));
    newEncounter.mobs.push(new EncounterMob("Thing That Should Not Be", newEncounter.filePath+"yorsahj.jpg", false, null, 104880));
    /*newEncounter.mobs.set("Star Augur Etraeus",
        new EncounterMob("Star Augur Etraeus", newEncounter.filePath+"etraeus.jpg", true, 0));
    newEncounter.mobs.set("Coronal Ejection",
        new EncounterMob("Coronal Ejection", "/icons/encounters/null.png", false));
    newEncounter.mobs.set("Voidling",
        new EncounterMob("Voidling", newEncounter.filePath+"void add 3.jpg", false));
    newEncounter.mobs.set("Thing That Should Not Be",
        new EncounterMob("Thing That Should Not Be", newEncounter.filePath+"yorsahj.jpg", false));
    newEncounter.mobs.set("Ice Crystal",
        new EncounterMob("Ice Crystal", newEncounter.filePath+"ice crystal.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"6.png", 0.496, -3371, -676);
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(104880);//thing that should not be
    }
    newEncounter.setupVisuals = function()
    {
        var etraeus = lookupActorByID(103758)[0];//etraeus
        if(!etraeus)
            return;
        var phaseCount = 0;
        var p2StartTime = Number.MAX_VALUE;
        var p3StartTime = Number.MAX_VALUE;
        var p2VoidZones = [];
        var p2MeteorHits = [];
        for(var castI = 0; castI < etraeus.casts.CA.length; castI++)
        {
            var cast = etraeus.casts.CA[castI];
            if(spells[cast.spellIndex].id === 221875)//nether traversal
            {
                phaseCount++;
                if(phaseCount === 1)
                {
                    this.addPhase(1, "blue", cast.time+cast.castLength);
                }
                else if(phaseCount === 2)
                {
                    this.addPhase(2, "green", cast.time+cast.castLength);
                    p2StartTime = cast.time+cast.castLength;
                }
                else if(phaseCount === 3)
                {
                    this.addPhase(3, "purple", cast.time+cast.castLength);
                    p3StartTime = cast.time+cast.castLength;
                }
            }
            else if(spells[cast.spellIndex].id === 207439 || spells[cast.spellIndex].id === 206949 ||//voidNova, frigidnova,
                spells[cast.spellIndex].id === 205408)//grand conjunction
            {
                draw.timeline.addCast(cast);
            }
            else if(spells[cast.spellIndex].id === 206517)//fel nova
            {
                draw.timeline.addCast(cast);
                draw.sim.lowerVisuals.addStates("fel nova warning", 
                    cast.time, cast.castLength,
                    generateCircleOnActor(24, "rgba(0,255,0,0.5)", etraeus));
            }
        }
        for(var actorI = 0; actorI < actors.length; actorI++)
        {
            var actor = actors[actorI];
            if(actor.name === "Ice Crystal")
            {
                var numStates = actor.states.SA.length;
                if(numStates === 0)
                    continue;
                actor.states.SA[numStates-1].time = p2StartTime;
                var startTime = actor.states.SA[0].time;
                var endTime = actor.states.SA[numStates-1].time;
                draw.sim.lowerVisuals.addStates("p1 dot range",
                    startTime, endTime-startTime,
                    generateCircleOnActor(8, "rgba(91,233,233,0.5)", actor));
            }
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 206965 || spells[a.spellIndex].id === 206388 ||//voidburst, felburst
                    spells[a.spellIndex].id === 206398)//felflame
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuffs w/ stacks",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                        }
                    }
                }//if voidburst
                else if(spells[a.spellIndex].id === 205984)//p1 gravitational pull
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("p1p2 pull",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                            draw.sim.lowerVisuals.addStates("p1p2 meteor range",
                                auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(5, "rgba(255,0,0,0.5)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 214167)//p2 gravitational pull
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("p1p2 pull",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255,255,255)"));
                            draw.sim.lowerVisuals.addStates("p1p2 meteor range",
                                auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(5, "rgba(255,0,0,0.5)", actor));
                        }
                        else if(auraState instanceof a.stateRemoved)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            p2MeteorHits.push({x:loc.x, y:loc.y, time:auraState.time});
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 214335)//p3 gravitational pull
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("p1p2 pull",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("p1p2 meteor range",
                                auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(5, "rgba(255,0,0,0.5)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 206585 ||//p3 gravitational pull, absolute zero
                    spells[a.spellIndex].id === 206589 || //chilled
                    spells[a.spellIndex].id === 205445 || spells[a.spellIndex].id === 216345 || //red starsign, green starsign
                    spells[a.spellIndex].id === 216344 || spells[a.spellIndex].id === 205429) //blue starsign, yellow starsign
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("regular debuffs",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 206936)//icy ejection(p1 dot)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("regular debuffs",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("p1 dot range",
                                auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(8, "rgba(91,233,233,0.5)", actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 205649)//fel ejection(p2 dot)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("regular debuffs",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            for(var time = auraState.time+2000; time < auraState.endTime+100; time+=2000)
                            {
                                var loc = actor.getStateAtTime(time);
                                p2VoidZones.push({x:loc.x, y:loc.y, time:time, endTime:p3StartTime});
                            }
                        }
                    }
                }
            });//foreach aura
        }//for actors
        for(var voidI = 0; voidI < p2VoidZones.length; voidI++)
        {
            var voidz = p2VoidZones[voidI];
            for(var hitI = 0; hitI < p2MeteorHits.length; hitI++)
            {
                var hit = p2MeteorHits[hitI];
                if(hit.time < voidz.time || voidz.endTime < hit.time)
                    continue;
                var dx = hit.x - voidz.x;
                var dy = hit.y - voidz.y;
                var dist = Math.sqrt(dx*dx + dy*dy);
                if(dist < 6.5)
                {
                    voidz.endTime = hit.time;
                }
            }

            draw.sim.lowerVisuals.addStates("fel Ejection voidzone",
                voidz.time, voidz.endTime-voidz.time,
                generateCircleOnLocation(2,"rgb(0,150,0)", voidz.x, voidz.y));
        }
    };//setupVisuals()
};//initEtraeus()

function initElisande(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/elisande/"
    newEncounter.mobs.push(new EncounterMob("Elisande", newEncounter.filePath+"elisande.jpg", true, 0, 106643));
    newEncounter.mobs.push(new EncounterMob("Recursive Elemental", newEncounter.filePath+"blue ele.jpg", false, null, 105299));
    newEncounter.mobs.push(new EncounterMob("Expedient Elemental", newEncounter.filePath+"pink ele.jpg", false, null, 105301));

    /*newEncounter.mobs.set("Elisande",
        new EncounterMob("Elisande", newEncounter.filePath+"elisande.jpg", true, 0));
    newEncounter.mobs.set("Expedient Elemental",
        new EncounterMob("Expedient Elemental", newEncounter.filePath+"pink ele.jpg", false));
    newEncounter.mobs.set("Recursive Elemental",
        new EncounterMob("Recursive Elemental", newEncounter.filePath+"blue ele.jpg", false));*/
    newEncounter.mobsToIgnore = ["Echo of Elisande", "Arcanetic Ring"];
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"7.png", .313, -3290, -394);
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(105301);//expedient elemental
        cd.addDamageWindow(105299);//recursive elemental
    }
    newEncounter.setupVisuals = function()
    {
        this.addGroupSpawnToTimeline(105299);//recursive elemental
        this.addGroupSpawnToTimeline(105301);//expedient elemental
        var bosses = lookupActorByID(106643);//elisande
        for(var ei = 0; ei < bosses.length; ei++)
        {
            var boss = bosses[ei];
            if(boss.states.SA.length <= 10)
            {
                boss.class.isImportant = false;
                boss.states.nextTime = Number.MAX_VALUE;
                boss.state = null;
                for(var si = 0; si < boss.states.SA.length; si++)
                {
                    boss.states.SA[si].time = Number.MAX_VALUE;
                }
            }
        }
        var elisande = bosses[0];
        var phase = 0;
        var p2StartTime = Number.MAX_VALUE;
        var p3StartTime = Number.MAX_VALUE;
        this.addPhase(1, "green", 0);
        for(var ci = 0; ci < elisande.casts.CA.length; ci++)
        {
            var cast = elisande.casts.CA[ci];
            if(spells[cast.spellIndex].id === 208863)//leave the nightwell
            {
                phase++;
                if(phase === 2)
                {
                    this.addPhase(2, "yellow", cast.time+cast.castLength);
                    p2StartTime = cast.time+cast.castLength;
                }
                else if(phase === 3)
                {
                    this.addPhase(3, "red", cast.time+cast.castLength);
                    p3StartTime = cast.time+cast.castLength
                }
            }
        }

        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.class.mobID === 105299 || actor.class.mobID === 105301)//recursive and expedient elementals
            {
                var duration = actor.class.mobID === 105299?60000:30000;//recursive
                var color = actor.class.mobID === 105299?"rgba(0,178, 255, 0.6)":"rgba(255,122, 235, 0.6)";//recursive
                var lastState = actor.states.SA[actor.states.SA.length-1];
                if(lastState instanceof Death)
                {
                    var endTime = lastState.time + duration;
                    if(lastState.time < p2StartTime && endTime > p2StartTime)
                        endTime = p2StartTime;
                    if(lastState.time < p3StartTime && endTime > p3StartTime)
                        endTime = p3StartTime;
                    draw.sim.upperVisuals.addStates("slow zone",
                        lastState.time, endTime-lastState.time,
                        generateCircleOnLocation(10, color, lastState.x, lastState.y));
                }
            }
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 209598)//conflexive burst
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff icon",
                                auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("conflexive burst explosion",
                                auraState.endTime, 1000,
                                generateCircleOnActor(30, "rgba(255,0,0,0.3)", actor));
                        }
                    }
                }//conflexive burst
                else if(spells[a.spellIndex].id === 209973)//ablating explosion
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff icon",
                                auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor));

                            draw.sim.lowerVisuals.addStates("ablating explossion range",
                                auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(15, "rgba(255,0,0,0.5)", actor));
                        }
                    }
                }//ablating expllosion
                else if(spells[a.spellIndex].id === 208659)//Arcanetic ring
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff icon",
                                auraState.time, auraState.endTime-auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 209244)//delphuric beam
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("beam",
                                auraState.time, auraState.endTime-auraState.time,
                                generateLineBetweenActors(actor, actors[a.source], "rgb(255,255,255)", 1));
                        }
                    }
                }
            });//foreach Aura
        }//for actors
    }//setupVisuals()
};//initElisande()

function initGuldan(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nighthold/Guldan/"
    newEncounter.mobs.push(new EncounterMob("Gul'dan", newEncounter.filePath+"gul'dan.jpg", true, 0, 104154));
    newEncounter.mobs.push(new EncounterMob("Fel Lord Kuraz'mal", newEncounter.filePath+"fel lord.jpg", false, null, 104537));
    newEncounter.mobs.push(new EncounterMob("Inquisitor Vethriz", newEncounter.filePath+"tall robes.jpg", false, null, 104536));
    newEncounter.mobs.push(new EncounterMob("D'zorykx the Trapper", newEncounter.filePath+"trapper.jpg", false, null, 104534));
    newEncounter.mobs.push(new EncounterMob("Eye of Gul'dan", newEncounter.filePath+"eye.jpg", false, null, 105630));
    newEncounter.mobs.push(new EncounterMob("Empowered Eye of Gul'dan", newEncounter.filePath+"eye.jpg", false, null, 106545));
    newEncounter.mobs.push(new EncounterMob("Azagrim", newEncounter.filePath+"tichondrius.jpg", false, null, 105295));
    newEncounter.mobs.push(new EncounterMob("Beltheris", newEncounter.filePath+"tichondrius.jpg", false, null, 107232));
    newEncounter.mobs.push(new EncounterMob("Dalvengyr", newEncounter.filePath+"tichondrius.jpg", false, null, 107233));
    newEncounter.mobs.push(new EncounterMob("Light's Heart", null, false, null, 116156));

    /*newEncounter.mobs.set("Gul'dan",
        new EncounterMob("Gul'dan", newEncounter.filePath+"gul'dan.jpg", true, 0));
    newEncounter.mobs.set("Fel Lord Kuraz'mal",
        new EncounterMob("Fel Lord Kuraz'mal", newEncounter.filePath+"fel lord.jpg", false));
    newEncounter.mobs.set("Inquisitor Vethriz",
        new EncounterMob("Inquisitor Vethriz", newEncounter.filePath+"tall robes.jpg", false));
    newEncounter.mobs.set("D'zorykx the Trapper",
        new EncounterMob("D'zorykx the Trapper", newEncounter.filePath+"trapper.jpg", false));
    newEncounter.mobs.set("Eye of Gul'dan",
        new EncounterMob("Eye of Gul'dan", newEncounter.filePath+"eye.jpg", false));
    newEncounter.mobs.set("Empowered Eye of Gul'dan",
        new EncounterMob("Empowered Eye of Gul'dan", newEncounter.filePath+"eye.jpg", false));
    newEncounter.mobs.set("Dreadlord",
        new EncounterMob("Dreadlord", newEncounter.filePath+"tichondrius.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"9.png", .316, -3292, -391);
    
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(105630, 30000);//eye of gul'dan
        cd.addDamageWindow(106545, 30000);//emp. eye of guldan
        cd.addDamageWindow(105295);//dreadlords
        cd.addDamageWindow(107232);
        cd.addDamageWindow(107233);
    };

    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        this.addGroupSpawnToTimeline(104537);//fel lord kurazmal
        this.addGroupSpawnToTimeline(104536);//inquisitor vethriz
        this.addGroupSpawnToTimeline(104534);//d'zorykx the trapper
        this.addGroupSpawnToTimeline(105295);//dreadlords
        this.addGroupSpawnToTimeline(107232);
        this.addGroupSpawnToTimeline(107233);

        
        var guldan = lookupActorByID(104154)[0];//gul'dan
        if(!guldan)
            return;
        var thisHelper = this;
        var stormTimes = [];
        var flamePatches = [];
        var soulCount = [];
        var p3StartTime = null;
        guldan.auras.AM.forEach(function(a){
            if(spells[a.spellIndex].id === 206516)//eye of amanthul(p1)
            {
                for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                {
                    var auraState = a.AA[auraStateIndex];
                    if(auraState instanceof a.stateRemoved)
                    {
                        thisHelper.addPhase(2, "yellow", auraState.time);
                    }
                }
            }
            else if(spells[a.spellIndex].id === 227427)//eye of amanthul(p2->p3)
            {
                for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                {
                    var auraState = a.AA[auraStateIndex];
                    if(auraState instanceof a.stateRemoved)
                    {
                        thisHelper.addPhase(3, "red", auraState.time);
                        p3StartTime = auraState.time;
                    }
                }
            }
        });//guldan auras

        for(var di = 0; di < guldan.damageDone.AA.length; di++)
        {
            var dmg = guldan.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 206515)//fel efflux
            {
                draw.sim.lowerVisuals.addStates("fel efflux laser", dmg.time, 500,
                    generateVectorBetweenActors(guldan, actors[dmg.target], 1, "rgb(0,255,0)"));
            }
            else if(spells[dmg.spellIndex].id === 227550)//fel scythe
            {
                draw.sim.upperVisuals.addStates("fel scythe hit", dmg.time, 1000,
                    generateLineBetweenActors(guldan, actors[dmg.target], "RGB(0,255,0)", 6, null, null, true ));
            }
        }

        for(var castI = 0; castI < guldan.casts.CA.length; castI++)
        {
            var cast = guldan.casts.CA[castI];
            if(spells[cast.spellIndex].id === 167819)//storm 1
            {
                draw.timeline.addCast(cast);
                draw.sim.lowerVisuals.addStates("storm 1",
                    cast.time, cast.castLength,
                    generateCircleOnActor(10, "rgba(150,0,150,0.7)", guldan));
            }
            else if(spells[cast.spellIndex].id === 167935)//storm 2
            {
                draw.sim.lowerVisuals.addStates("storm 2",
                    cast.time, cast.castLength,
                    generateCircleOnActor(20, "rgba(150,0,150,0.7)", guldan));
            }
            else if(spells[cast.spellIndex].id === 177380)//storm 3
            {
                draw.sim.lowerVisuals.addStates("storm 3",
                    cast.time, cast.castLength,
                    generateCircleOnActor(30, "rgba(150,0,150,0.7)", guldan));
            }
            else if(spells[cast.spellIndex].id === 152987)//storm 4
            {
                var loc = guldan.getStateAtTime(cast.time+cast.castLength);
                stormTimes.push({time:cast.time+cast.castLength, x:loc.x, y:loc.y});
                draw.sim.lowerVisuals.addStates("storm 4",
                    cast.time, cast.castLength,
                    generateCircleOnActor(60, "rgba(150,0,150,0.7)", guldan));
            }
            else if(spells[cast.spellIndex].id === 206222 ||//bonds of fel
                spells[cast.spellIndex].id === 211152 ||//emp. eye
                spells[cast.spellIndex].id === 206221 ||//emp. bonds of fel
                spells[cast.spellIndex].id === 206744 ||//black harvest
                spells[cast.spellIndex].id === 209270)//eye of guldan
            {
                draw.timeline.addCast(cast);
            }
        }

        //identify the dreadlords and mark them appropriately
        for(var actorI = 0; actorI < actors.length; actorI++)
        {
            var actor = actors[actorI];
            if(actor.class.mobID === 104537 || actor.class.mobID === 104536 ||//kurazmal, vethriz
                actor.class.mobID === 104534 || actor.class.mobID === 105295 ||//dzorykx, azagrim
                actor.class.mobID === 107232 || actor.class.mobID === 107233)//beltheris, dalvengyr
            {
                var firstState = actor.states.SA[0];
                draw.sim.lowerVisuals.addStates("hand of guldan impact",
                    firstState.time-3500, 3500,
                    generateCircleOnLocation(6, "rgba(196, 0, 196, 0.6)", firstState.x, firstState.y));
            }

            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 209011 || spells[a.spellIndex].id === 206384)//bonds of fel, emp.Bonds
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var maxDist = 0;
                            var maxState = firstState = actor.getStateAtTime(auraState.time);
                            if(spells[a.spellIndex].id === 206384)//empowered
                            {
                                for(var dTime = 0; dTime < 4000; dTime += 200)
                                {
                                    var newLoc = actor.getStateAtTime(auraState.time+dTime);
                                    var dx = newLoc.x - firstState.x;
                                    var dy = newLoc.y - firstState.y;
                                    var dist = Math.sqrt(dx*dx + dy*dy);
                                    if(dist > maxDist)
                                    {
                                        maxState = newLoc;
                                        maxDist = dist;
                                    }
                                }
                            }
                            draw.sim.lowerVisuals.addStates("bonds range", 
                                auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnLocation(10, "rgba(200,200,200,0.5)", maxState.x, maxState.y));
                            draw.sim.upperVisuals.addStates("bonds explosion", 
                                auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(5, "rgba(255,0,0,0.5)", actor));
                        }
                    }
                }//bonds of fel
                else if(spells[a.spellIndex].id === 209454 || spells[a.spellIndex].id === 221728)//eye of guldan, emp. eye
                {
                    var color = (spells[a.spellIndex].id === 209454)?"196,0,196":"255,0,0";
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("eye target",
                                auraState.time, auraState.endTime-auraState.time,
                                generateLineBetweenActors(actor, actors[a.source], "rgb("+color+")", 2, null, null, true));
                            draw.sim.upperVisuals.addStates("eye splash",
                                auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(8, "rgba("+color+",0.5)", actor))
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 221606 || spells[a.spellIndex].id === 210339)//flames warning, time dilation
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("debuff icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 208802 ||  spells[a.spellIndex].id === 227556)//Soul Corrosion, fury of the fel
                {

                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            if(spells[a.spellIndex].id === 208802)//soul Corrosion  
                                soulCount.push({change:-1, time: auraState.time});
                            draw.sim.upperVisuals.addStates("debuff with stacks icon",
                                auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255, 255, 255)"));
                        }
                        else if(auraState instanceof a.stateStack && spells[a.spellIndex].id === 208802)
                            soulCount.push({change:-1, time: auraState.time});
                    }
                }
                else if(spells[a.spellIndex].id === 221891)//soul siphon
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            soulCount.push({change:1, time: auraState.time});
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 221603)//flames of sargeras
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("flame damage",
                                auraState.time, auraState.endTime-auraState.time,
                                generateCircleOnActor(8, "rgba(150,0,0,0.5)", actor));
                            for(var time = auraState.time; time < auraState.endTime+10; time+= 1000)
                            {
                                var loc = actor.getStateAtTime(time);
                                flamePatches.push({time:time, endTime:Number.MAX_VALUE, x:loc.x, y:loc.y, name: actor.name});

                            }
                        }
                    }
                }
            });//foreach aura
        }//for actors
        flamePatches.sort(function(a,b){return a.time-b.time;});
        for(var patchI = 0; patchI < flamePatches.length; patchI++)
        {
            var patch = flamePatches[patchI];
            for(var stormI = 0; stormI < stormTimes.length; stormI++)
            {
                var storm = stormTimes[stormI];
                if(patch.time > storm.time || storm.time > patch.endTime)
                    continue;
                var dx = storm.x - patch.x; 
                var dy = storm.y - patch.y;
                var dist = Math.sqrt(dx*dx+dy*dy);
                if(dist <= 60)
                    patch.endTime = storm.time;
            }
            draw.sim.lowerVisuals.addStates("Flame patch",
                patch.time, patch.endTime-patch.time,
                generateCircleOnLocation(5, "rgb(150, 0,0)", patch.x, patch.y));
        }
        if(p3StartTime !== null)
        {
            var soulWellIcon = new Image();
            soulWellIcon.src = this.filePath+"soulwell.jpg";
            var stackInfo = [];
            stackInfo.push({time:p3StartTime, stacks:0});
            soulCount.sort(function(a,b){return a.time-b.time;});
            for(var soulI = 0; soulI < soulCount.length; soulI++)
            {
                stackInfo.push({time:soulCount[soulI].time, stacks:stackInfo[stackInfo.length-1].stacks+soulCount[soulI].change});
            }
            draw.sim.lowerVisuals.addStates("well of souls count",
                p3StartTime, Number.MAX_VALUE,
                generateFakeAuraIconWithStacksOnLocation(soulWellIcon, -3135, -282, stackInfo, "rgb(255,255,255)", null, 3));
        }//well of soul count
    };//setupVisuals()
};//initGuldan()