function initNythendra(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Nythendra/";
    newEncounter.mobs.push(new EncounterMob("Nythendra", newEncounter.filePath+"Nythendra.jpg", true, 0, 102672));
    newEncounter.mobs.push(new EncounterMob("Corrupted Vermin", null, false, null, 102998));
    /*newEncounter.mobs.set("Nythendra",
        new EncounterMob("Nythendra", newEncounter.filePath+"Nythendra.jpg", true, 0));
    newEncounter.mobs.set("Corrupted Vermin",
        new EncounterMob("Corrupted Vermin", null, false));*/

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"nythendraBlp.png", 0.639, -1672, -2088);//orig: 0.65, -1592, -2040
    
    newEncounter.setupVisuals = function()
    {
        var drawInfestedGround = function(startTime, x, y, enc)
        {
            var nextP1 = Number.MAX_VALUE;
            for(var phaseIndex = 0; phaseIndex < enc.phases.length; phaseIndex++)
            {
                if(enc.phases[phaseIndex].time > startTime)
                {
                    nextP1 = enc.phases[phaseIndex].time;
                    break;
                }
            }
            draw.sim.lowerVisuals.addStates("Infested Ground", startTime, nextP1-startTime,
                generateCircleOnLocation(3,"rgba(144, 234, 0,0.5)", x, y));
        }

        this.addPhase(1, "green", 0);
        var nyth = lookupActorByID(102672)[0];
        if(!nyth)
            return;

        for(var ci = 0; ci < nyth.casts.CA.length; ci++)
        {
            var cast = nyth.casts.CA[ci];
            if(spells[cast.spellIndex].id === 203552)// Heart of the Swarm
            {
                this.addPhase(2, "yellow", cast.time+cast.castLength);
                this.addPhase(1, "green", cast.time+cast.castLength+20000);
            }
        }
        for(var di = 0; di < nyth.damageDone.AA.length; di++)
        {
            var damage = nyth.damageDone.AA[di];
            if(spells[damage.spellIndex].id === 202978)//Infested Breath
            {
                var casterLoc = nyth.getStateAtTime(damage.time);
                var targLoc = actors[damage.target].getStateAtTime(damage.time);
                var dir = getAngleBetweenPoints(casterLoc.x, casterLoc.y,targLoc.x, targLoc.y);
                draw.sim.lowerVisuals.addStates("Infested Breath", damage.time-3000, 3500,
                    generateConeOnActor(nyth, dir, Math.PI/16, 60, "rgba(0,255,0,0.4)"));
            }
        }


        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];


            if(actor.name === "Corrupted Vermin")
            {
                var CA = actor.casts.CA;
                if(CA.length > 0 && spells[CA[0].spellIndex].id === 203646)//Burst of Corruption
                {
                    var startTime = CA[0].time-3000;
                    var duration = CA[CA.length-1].time - startTime;
                    draw.sim.lowerVisuals.addStates("Burst of Corruption", startTime, duration,
                        generateCircleOnLocation(8, "rgba(0,255,0,0.6)", actor.states.SA[0].x, actor.states.SA[0].y));
                }
            }
            else
            {
                var thisHelper = this;
                actor.auras.AM.forEach(function(a){
                    drawRaidmarks(a, actor);
                    if(spells[a.spellIndex].id === 204463)//volatile rot
                    {
                        for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                        {
                            var auraState = a.AA[auraStateIndex];
                            if(auraState instanceof a.stateApplied)
                            {
                                draw.sim.lowerVisuals.addStates("Volatile Rot Range", auraState.time, auraState.endTime - auraState.time,
                                    generateCircleOnActor(20, "rgba(165, 0, 0, 0.4)", actor));
                                draw.sim.upperVisuals.addStates("Volatile Rot Icon", auraState.time, auraState.endTime - auraState.time,
                                    generateAuraIconOnActor(a, actor));
                            }
                            else if(auraState instanceof a.stateRemoved)
                            {
                                var loc = actor.getStateAtTime(auraState.time);
                                drawInfestedGround(auraState.time, loc.x, loc.y, thisHelper);
                            }
                        }
                    }
                    else if(spells[a.spellIndex].id === 203096)//rot
                    {
                        for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                        {
                            var auraState = a.AA[auraStateIndex];
                            if(auraState instanceof a.stateApplied)
                            {
                                draw.sim.lowerVisuals.addStates("Rot Range", auraState.time, auraState.endTime - auraState.time,
                                    generateCircleOnActor(8, "rgba(0, 125, 0, 0.4)", actor));
                                draw.sim.upperVisuals.addStates("Rot Icon", auraState.time, auraState.endTime - auraState.time,
                                    generateAuraIconOnActor(a, actor));
                            }
                            else if(auraState instanceof a.stateRemoved)
                            {
                                var loc = actor.getStateAtTime(auraState.time);
                                drawInfestedGround(auraState.time, loc.x, loc.y, thisHelper);
                            }
                        }
                    }
                    else if(spells[a.spellIndex].id === 204504)//infested
                    {
                        for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                        {
                            var auraState = a.AA[auraStateIndex];
                            if(auraState instanceof a.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("Infested stacks", auraState.time, auraState.endTime - auraState.time,
                                    generateStackCountOnActor(a, actor, "rgb(144, 234, 0)"));
                            }
                        }
                    }
                    else if(spells[a.spellIndex].id === 203646)//burst of corruption stacks
                    {
                        for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                        {
                            var auraState = a.AA[auraStateIndex];
                            if(auraState instanceof a.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("Burst of corruption stacks", auraState.time, auraState.endTime - auraState.time,
                                    generateStackCountOnActor(a, actor, "rgb(200, 0, 0)"));
                            }
                        }
                    }
                });//actors - for each aura
            }//else misc. actors
        }//for actors
        var envir = actors[0];
        for(var di = 0; di < envir.damageDone.AA.length; di++)
        {
            var damage = envir.damageDone.AA[di];
            var loc = actors[damage.target].getStateAtTime(damage.time);
            if(spells[damage.spellIndex].id === 203045)//infested ground
            {
                drawInfestedGround(damage.time, loc.x, loc.y, this);
            }
        }
    };//setupVisuals()
};//initNythendra()

function initElerethe(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Elerethe/";

    newEncounter.mobs.push(new EncounterMob("Elerethe Renferal", newEncounter.filePath+"Elerethe.jpg", true, 0, 106087));
    newEncounter.mobs.push(new EncounterMob("Venomous Spiderling", newEncounter.filePath+"venomousSpider.jpg", false, null, 107459));
    newEncounter.mobs.push(new EncounterMob("Skittering Spiderling", newEncounter.filePath+"SkitteringSpider.jpg", false, null, 108542));
    newEncounter.mobs.push(new EncounterMob("Venomous Spiderling", newEncounter.filePath+"venomousSpider.jpg", false, null, 111721));
    newEncounter.mobs.push(new EncounterMob("Venomous Spiderling", newEncounter.filePath+"venomousSpider.jpg", false, null, 106311));
    /*newEncounter.mobs.set("Elerethe Renferal",
        new EncounterMob("Elerethe Renferal", newEncounter.filePath+"Elerethe.jpg", true, 0));
    newEncounter.mobs.set("Venomous Spiderling",
        new EncounterMob("Venomous Spiderling", newEncounter.filePath+"venomousSpider.jpg", false));
    newEncounter.mobs.set("Skittering Spiderling",
        new EncounterMob("Skittering Spiderling", newEncounter.filePath+"SkitteringSpider.jpg", false));
    newEncounter.mobs.set("Twisting Shadows",
        new EncounterMob("Twisting Shadows", null, false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"eleretheBlp.png", 0.592, -11599, -11662);
    
    newEncounter.actorRemovalTest = function(a)
    {
        return (a.name === "Twisting Shadows");
    }

    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow([111721,106311], 45000);//venomous spiderlings(prob should only be one type)
    };

    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        var webA = [];
        var webB = [];
        var currentPhase = 1;
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.class.mobID === 106087)//elerethe
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 214348)//Vile Ambush
                    {
                        draw.sim.lowerVisuals.addStates("Vile Ambush", cast.time-5000, 5000,
                            generateCircleOnActor(25, "rgba(0,255,0,0.5)", actor));
                        draw.timeline.addCast(cast);
                    }
                    else if(spells[cast.spellIndex].id === 210547)//razor wing
                    {
                        var target = actor.getTargetAtTime(cast.time);
                        if(target !== null)
                        {
                            var eleLoc = actor.getStateAtTime(cast.time);
                            var targLoc = actors[target].getStateAtTime(cast.time);
                            var dir = getAngleBetweenPoints(eleLoc.x, eleLoc.y, targLoc.x, targLoc.y);
                            draw.sim.lowerVisuals.addStates("Razor Wing", cast.time, cast.castLength,
                                generateConeOnActor(actor, dir, Math.PI/4, 50, "rgba(255,0,0,0.5)"));
                            draw.timeline.addCast(cast);

                        }    
                    }
                    else if(spells[cast.spellIndex].id === 210864 && currentPhase === 1)//twisting Shadows
                    {
                        currentPhase = 2;
                        this.addPhase(2, "purple", cast.time);
                    }
                    else if(spells[cast.spellIndex].id === 215288 && currentPhase === 2)//web of pain
                    {
                        currentPhase = 1;
                        this.addPhase(1, "green", cast.time);
                    }
                    else if(spells[cast.spellIndex].id === 218124)//violent winds
                    {
                        var target = actor.getTargetAtTime(cast.time);
                        draw.sim.lowerVisuals.addStates("Violent Winds", cast.time+cast.castLength, 8000,
                            generateVectorBetweenActors(actor, actors[target], 7, "rgba(0,0,200,0.6)"));
                    }
                }
            }
            else if(ai === 0)//environment
            {
                for(var di = 0; di < actor.damageDone.AA.length; di++)
                {
                    var dmg = actor.damageDone.AA[di];
                    if(spells[dmg.spellIndex].id === 213124)//venomous pool
                    {
                        var loc = actors[dmg.target].getStateAtTime(dmg.time);
                        draw.sim.lowerVisuals.addStates("Venomous Pool", dmg.time, Number.MAX_VALUE,
                            generateCircleOnLocation(5, "rgba(144, 234, 0,0.5)", loc.x, loc.y));
                    }
                }
            }
            else if(actor.class.mobID === 107459 || actor.class.mobID === 108542 ||
                actor.class.mobID === 111721||actor.class.mobID === 106311)//both spiderlings
            {
                if(actor.states.SA.length > 2)
                {
                    var loc = actor.states.SA[actor.states.SA.length-2];
                    draw.sim.lowerVisuals.addStates("Venomous Pool", loc.time, Number.MAX_VALUE,
                        generateCircleOnLocation(5, "rgba(144, 234, 0,0.5)", loc.x, loc.y));
                }
            }
            var thisHelper = this;
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 215307)//web of pain A
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            webA.push({actor:actor, time:auraState.time, endTime:auraState.endTime});
                        }
                    }
                }//web a
                else if(spells[a.spellIndex].id === 215300)//web of pain B
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            webB.push({actor:actor, time:auraState.time, endTime:auraState.endTime});
                        }
                    }
                }//web b
                else if(spells[a.spellIndex].id === 215489)//venomous pool(spiderling stacks)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            draw.sim.lowerVisuals.addStates("Venomous Pool", auraState.time, Number.MAX_VALUE,
                                generateCircleOnLocation(5, "rgba(144, 234, 0,0.5)", loc.x, loc.y));
                        }
                    }
                }//spiderling pool
                else if(spells[a.spellIndex].id === 215460)//necrotic venom
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Necrotic Venom Range", auraState.time - 10000, 10000+6000,
                                generateCircleOnActor(7, "rgba(0,155,0,0.5)", actor));
                            for(var timer = auraState.time; timer < auraState.endTime+100; timer += 1000)
                            {
                                var loc = actor.getStateAtTime(timer);
                                draw.sim.lowerVisuals.addStates("Venomous Pool", timer, Number.MAX_VALUE,
                                    generateCircleOnLocation(5, "rgba(144, 234, 0,0.5)", loc.x, loc.y));
                            }
                        }
                    }
                }
                //not currently tracked in the log
                /*else if(spells[a.spellIndex].id === )//Twisting Shadows
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Twisting Shadows Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                        else if(auraState instanceof a.stateRemoved)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            if(loc === null)
                                continue;
                            draw.sim.lowerVisuals.addStates("Twisting Shadows Voidzone", auraState.time, 30000,
                                generateCircleOnLocation(12, "rgba(289, 60, 77, 0.5)", loc.x, loc.y));
                        }
                    }
                }*/
            });//foreach aura
        }//for actors
        for(var wai = 0; wai < webA.length; wai++)
        {
            var targA = webA[wai];
            for(var wbi = 0; wbi < webB.length; wbi++)
            {
                var targB = webB[wbi];
                if(Math.abs(targA.time - targB.time) < 500 && targA.actor.class.isTank === targB.actor.class.isTank)
                {
                    draw.sim.upperVisuals.addStates("Web of Pain", targA.time, targA.endTime - targA.time,
                        generateLineBetweenActors(targA.actor, targB.actor, "rgb(255,255,255)", 4, 20, "rgb(255,0,0)", true));
                }
            }
        }
    };

};//initElerethe()

function initUrsoc(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Ursoc/";
    newEncounter.mobs.push(new EncounterMob("Ursoc", newEncounter.filePath+"ursoc.jpg", true, 0, 100497));
    newEncounter.mobs.push(new EncounterMob("Nightmare Image", newEncounter.filePath+"nightmareImage.jpg", false, null, 100576));

    /*newEncounter.mobs.set("Ursoc",
        new EncounterMob("Ursoc", newEncounter.filePath+"ursoc.jpg", true, 0));
    newEncounter.mobs.set("Nightmare Image",
        new EncounterMob("Nightmare Image", newEncounter.filePath+"nightmareImage.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"ursocBlp.png", 0.667, 12783, 12060);//0.878, 12780, 12059);//orig: 0.65, -1592, -2040  
    
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1, "green", 0);
        var ursoc = lookupActorByID(100497)[0];//ursoc
        if(!ursoc)
            return;
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.class.mobID === 100497)//ursoc
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 197969)
                    {
                        draw.sim.lowerVisuals.addStates("Roaring Cacophy Warning", cast.time, cast.castLength, 
                            generateCircleOnActor(20, "rgba(170, 91, 255, 0.4)", actor));
                        if(this.difficulty >= 2)
                        {
                            var loc = actor.getStateAtTime(cast.time + cast.castLength);
                            draw.sim.lowerVisuals.addStates("Roaring Cacophy Voidzone", cast.time+cast.castLength, 
                                newEncounter.isMythic()?120000:Number.MAX_VALUE,
                                generateCircleOnLocation(20, "rgba(170, 91, 255, 0.8)", loc.x, loc.y));
                        }
                    }
                }
                //detect p2, make sure ursoc ends the fight below 30% before looking for when it happens
                if(actor.states.SA[actor.states.SA.length-1].curHP/actor.states.SA[actor.states.SA.length-1].maxHP < 0.3)
                {
                    //will find 30% faster if we start from the end and work backwards
                    for(var si = actor.states.SA.length-1; si >= 0; si--)
                    {
                        var hpPercent = actor.states.SA[si].curHP/actor.states.SA[si].maxHP;
                        if(hpPercent >= 0.3)
                        {
                            this.addPhase(2,"red", actor.states.SA[si].time);
                            break;
                        }
                    }
                }
            }

            var thisHelper = this;
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 197943)//overwhelm
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Overwhelm Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(206, 182, 0)"));
                        }
                    }
                }//overwhelm
                else if(spells[a.spellIndex].id === 204859)//rend flesh
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Rend Flesh Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(a, actor, "rgb(255, 0, 0)"));
                        }
                    }
                }//rend flesh
                else if(spells[a.spellIndex].id === 198006)//focused Gaze
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.timeline.addCast({time:auraState.time, castLength:0, spellIndex: a.spellIndex});
                            draw.sim.upperVisuals.addStates("Focused Gaze Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            draw.sim.lowerVisuals.addStates("Charge Path", auraState.time, auraState.endTime - auraState.time,
                                generateLineBetweenActors(actor, ursoc, "rgba(255,0,0,0.5)", 15));
                        }
                    }
                }//rend flesh
                else if(spells[a.spellIndex].id === 198108)//momentum
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Momentum Cover", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(null, "rgba(190, 0, 0, 0.5)", actor));
                        }
                    }
                }//momentum
            });//for auras
        }//for actors
    };

};//initUrsoc()

function initDragonsOfNightmare(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/DragonsOfNightmare/";
    newEncounter.mobs.push(new EncounterMob("Ysondre", newEncounter.filePath+"dragons.jpg", true, 0, 115844));
    newEncounter.mobs.push(new EncounterMob("Ysondre", newEncounter.filePath+"dragons.jpg", true, 0, 102679));
    newEncounter.mobs.push(new EncounterMob("Emeriss", newEncounter.filePath+"dragons.jpg", true, null, 102683));
    newEncounter.mobs.push(new EncounterMob("Taerar", newEncounter.filePath+"dragons.jpg", true, null, 102681));
    newEncounter.mobs.push(new EncounterMob("Lethon", newEncounter.filePath+"dragons.jpg", true, null, 102682));
    newEncounter.mobs.push(new EncounterMob("Diseased Rift", null, false, null, 103378));
    newEncounter.mobs.push(new EncounterMob("Nightmare Rift", null, false, null, 103395));
    newEncounter.mobs.push(new EncounterMob("Shadowy Rift", null, false, null, 103396));
    newEncounter.mobs.push(new EncounterMob("Essence of Corruption", newEncounter.filePath+"essenceOfCorruption.jpg", false, null, 103691));
    newEncounter.mobs.push(new EncounterMob("Defiled Druid Spirit", newEncounter.filePath+"defiledSpirit.jpg", false, null, 103080));
    newEncounter.mobs.push(new EncounterMob("Dread Horror", newEncounter.filePath+"dreadHorror.jpg", false, null, 103044));
    newEncounter.mobs.push(new EncounterMob("Corrupted Mushroom", newEncounter.filePath+"mushroom.jpg", false, null, 103095));
    newEncounter.mobs.push(new EncounterMob("Corrupted Mushroom", newEncounter.filePath+"mushroom.jpg", false, null, 103096));
    newEncounter.mobs.push(new EncounterMob("Corrupted Mushroom", newEncounter.filePath+"mushroom.jpg", false, null, 103097));
    newEncounter.mobs.push(new EncounterMob("Shade of Taerar", newEncounter.filePath+"dragonShade.jpg", false, null, 103145));
    newEncounter.mobs.push(new EncounterMob("Seeping Fog", newEncounter.filePath+"fog.jpg", false, null, 103697));
    newEncounter.mobs.push(new EncounterMob("Spirit Shade", newEncounter.filePath+"spiritShade.jpg", false, null, 103100));
    newEncounter.mobs.push(new EncounterMob("Nightmare Bloom", newEncounter.filePath+"redFlower.jpg", false, null, 102804));

    /*newEncounter.mobs.set("Ysondre",
        new EncounterMob("Ysondre", newEncounter.filePath+"dragons.jpg", true, 0));
    newEncounter.mobs.set("Emeriss",
        new EncounterMob("Emeriss", newEncounter.filePath+"dragons.jpg", true));
    newEncounter.mobs.set("Lethon",
        new EncounterMob("Lethon", newEncounter.filePath+"dragons.jpg", true));
    newEncounter.mobs.set("Taerar",
        new EncounterMob("Taerar", newEncounter.filePath+"dragons.jpg", true));
    newEncounter.mobs.set("Shade of Taerar",
        new EncounterMob("Shade of Taerar", newEncounter.filePath+"dragonShade.jpg", false));
    newEncounter.mobs.set("Defiled Druid Spirit",
        new EncounterMob("Defiled Druid Spirit", newEncounter.filePath+"defiledSpirit.jpg", false));
    newEncounter.mobs.set("Dread Horror",
        new EncounterMob("Dread Horror", newEncounter.filePath+"dreadHorror.jpg", false));
    newEncounter.mobs.set("Spirit Shade",
        new EncounterMob("Spirit Shade", newEncounter.filePath+"spiritShade.jpg", false));
    newEncounter.mobs.set("Seeping Fog",
        new EncounterMob("Seeping Fog", newEncounter.filePath+"fog.jpg", false));
    newEncounter.mobs.set("Corrupted Mushroom",
        new EncounterMob("Corrupted Mushroom", newEncounter.filePath+"mushroom.jpg", false));
    newEncounter.mobs.set("Essence of Corruption",
        new EncounterMob("Essence of Corruption", newEncounter.filePath+"essenceOfCorruption.jpg", false));*/

    if(draw)
    {
        draw.sim.setMap(newEncounter.filePath+"dragonsBlp.png", 0.775, 12544, -864);
        draw.sim.updateBounds = function(x,y)
        {
            
            if(x < this.xMin && x > 12000)
                this.xMin = x; 
            if(x > this.xMax && x < 13200)
                this.xMax = x;
            if(y < this.yMin&& y > -900)
                this.yMin = y;
            if(y > this.yMax && y < -300)
                this.yMax = y;
        };
    }

    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(103100,30000);//spirit shade
        cd.addDamageWindow(103145, 30000);//shade of taerar
        cd.addDamageWindow(103691, 30000);//essence of corruption
    }

    newEncounter.setupVisuals = function()
    {
        var ysondre = lookupActorByID(115844)[0];//ysondre
        if(!ysondre)
            ysondre = lookupActorByID(102679)[0];//non-mythic ysondre?
        if(!ysondre)
            return;
        var emeriss = lookupActorByID(102683)[0];//emeriss
        var lethon = lookupActorByID(102682)[0];//lethon
        var taerar = lookupActorByID(102681)[0];//taerar
        var dragons = [ysondre, emeriss, lethon, taerar];
        var flowers = [];
        var flowerIcon = new Image();
        flowerIcon.src = newEncounter.filePath+"redFlower.jpg";

        var phaseCount = 1;
        this.addPhase(1, "green", 0);
        for(var si = 0; si < ysondre.states.SA.length; si++)
        {
            var hpPercent = ysondre.states.SA[si].curHP/ysondre.states.SA[si].maxHP;
            if(hpPercent <= 0.7 && phaseCount === 1)
            {
                phaseCount++;
                this.addPhase(2, "yellow", ysondre.states.SA[si].time);
            }
            else if(hpPercent <= 0.4 && phaseCount === 2)
            {
                this.addPhase(3, "red", ysondre.states.SA[si].time);
                break;
            }
        }
        for(var dri = 0; dri < dragons.length; dri++)
        {
            var dragon = dragons[dri];
            if(dragon === undefined)
                continue;
            removeDowntime(dragon);
            draw.sim.upperVisuals.addStates("Dragon Name", 0, Number.MAX_VALUE,
                generateLabelOnActor(dragon, dragon.name, "rgb(255,255,255)"));
            draw.sim.lowerVisuals.addStates("Dragon Range", 0, Number.MAX_VALUE,
                generateCircleOnActor(newEncounter.isMythic()?60:45, "rgba(255,255,255,0.25)", dragon));
            for(var di = 0; di < dragon.damageDone.AA.length; di++)
            {
                var dmg = dragon.damageDone.AA[di];
                if(spells[dmg.spellIndex].id === 203028 || spells[dmg.spellIndex].id === 204122)//corrupted breath/tail lash
                {
                    var rad, color;
                    if(spells[dmg.spellIndex].id === 203028)
                    {
                        rad = 50;
                        color = "rgba(255,0,0,0.5)";
                    }
                    else
                    {
                        rad = 20;
                        color = "rgba(255,153,0,0.5)";
                    }
                    var castLoc = dragon.getStateAtTime(dmg.time);
                    var targLoc = actors[dmg.target].getStateAtTime(dmg.time);
                    var dir = getAngleBetweenPoints(castLoc.x, castLoc.y, targLoc.x, targLoc.y);
                    draw.sim.upperVisuals.addStates("Corrupted Breath", dmg.time-2000, 2000,
                        generateConeBetweenActors(dragon, actors[dmg.target], Math.PI/9, rad, color));
                }//corrupted breath
            }//for casts
        }//for dragons
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.class.mobID === 103145)//shade of taerar
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 204767)//corrupted breath(shades)
                    {
                        var target = actor.getTargetAtTime(cast.time);
                        if(target !== null)
                        {
                            var castLoc = actor.getStateAtTime(cast.time);
                            var targLoc = actors[target].getStateAtTime(cast.time);
                            var dir = getAngleBetweenPoints(castLoc.x, castLoc.y, targLoc.x, targLoc.y);
                            draw.sim.lowerVisuals.addStates("Corrupted Breath", dmg.time-2000, 2000,
                                generateConeBetweenActors(dragon, actors[dmg.target], Math.PI/9, 50, "rgba(255,0,0,0.5)"));
                        }
                    }//corrupted breath
                }//for casts
            }//if Shade of Taerar
            else if(actor.class.mobID === 103100)//spirit shade
            {
                var sa = actor.states.SA;
                if(sa.length < 2)
                    continue;
                draw.sim.lowerVisuals.addStates("Shade Fixate", sa[0].time, sa[sa.length-1].time - sa[0].time, 
                    generateLineBetweenActors(actor, lethon, "rgba(0,0,255,0.5)", 4, null, null, true));
            }//if spirit shades
            else if(ai === 0)//environment
            {
                for(var di = 0; di < actor.damageDone.AA.length; di++)
                {
                    var dmg = actor.damageDone.AA[di];
                    if(spells[dmg.spellIndex].id === 203690)//nightmare bloom dot
                    {
                        draw.sim.upperVisuals.addStates("Nightmare Bloom Dot", dmg.time-500, 500,
                            generateCircleOnActor(4, "rgba(255, 56, 155, 0.6)", actors[dmg.target]));
                    }
                }
            }//if enfironment
            else if(actor.class.mobID === 102682)//lethon
            {
                for(var di = 0; di < actor.damageDone.AA.length; di++)
                {
                    var dmg = actor.damageDone.AA[di];
                    if(spells[dmg.spellIndex].id === 205870)//gloom
                    {
                        var loc = actors[dmg.target].getStateAtTime(dmg.time);
                        draw.sim.lowerVisuals.addStates("Gloom Range", dmg.time-3500, 3500,
                            generateCircleOnLocation(6, "rgba(0, 0, 255, 0.6)", loc.x, loc.y));
                    }
                }
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 203888)//Siphon Spirit
                    {
                        draw.timeline.addCast(cast);
                    }
                }
            }//if lethon
            else if(actor.class.mobID === 102683)//emeriss
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 205298)//Essence of Corruption
                    {
                        draw.timeline.addCast(cast);
                    }
                }
            }//if emeriss
            else if(actor.class.mobID === 102681)//taerar
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 204100 || spells[cast.spellIndex].id === 204078)//Shades of Taerar, bellowing roar
                    {
                        draw.timeline.addCast(cast);
                    }
                }
            }//if taerar
            else if(actor.class.mobID === 103095 || actor.class.mobID === 103096)//corrupted mushrooms
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 203827)//Corrupted Burst
                    {
                        draw.sim.lowerVisuals.addStates("Corrupted Burst Range", cast.time, cast.castLength,
                            generateCircleOnLocation(4, "rgb(255,0,0)", actor.states.SA[0].x, actor.states.SA[0].y));
                        draw.sim.upperVisuals.addStates("Mushroom Icon", cast.time, cast.castLength,
                            generateIconOnLocation(actor.class.icon, actor.states.SA[0].x, actor.states.SA[0].y, cast.time, cast.castLength));
                    }
                }
            }//if corrupted mushroom
            else if(actor.class.mobID === 103080)//defiled druid spirit
            {
                for(var ci = 0; ci < actor.casts.CA.length; ci++)
                {
                    var cast = actor.casts.CA[ci];
                    if(spells[cast.spellIndex].id === 203771)//Defiled Erruption
                    {   
                        actor.states.SA[0].time = cast.time;
                        var loc = actor.getStateAtTime(cast.time);
                        draw.sim.lowerVisuals.addStates("Defiled Erruption", cast.time, cast.castLength,
                            generateCircleOnLocation(10, "rgba(150,0,150,0.6)", loc.x, loc.y));
                    }
                }
            }
            else if(actor.class.mobID === 115844)//ysondre
            {
                for(var di = 0; di < actor.damageDone.AA.length; di++)
                {
                    var dmg = actor.damageDone.AA[di];
                    if(spells[dmg.spellIndex].id === 203153)//nightmare blast
                    {
                        var flowerFound = false;
                        var targLoc = actors[dmg.target].getStateAtTime(dmg.time);
                        if(targLoc === null)
                            continue;
                        for(var fi = 0; fi < flowers.length; fi++)
                        {
                            if(Math.abs(flowers[fi].time - dmg.time) < 100)
                            {
                                if(dmg.time < flowers[fi].time)
                                    flowers[fi].time = dmg.time;
                                flowerFound = true;
                                flowers[fi].numSrc++;
                                flowers[fi].x = targLoc.x*(1/flowers[fi].numSrc) + flowers[fi].x*((1-flowers[fi].numSrc)/flowers[fi].numSrc);
                                flowers[fi].y = targLoc.y*(1/flowers[fi].numSrc) + flowers[fi].y*((1-flowers[fi].numSrc)/flowers[fi].numSrc);
                            }
                        }
                        if(!flowerFound)
                        {
                            var fi = flowers.length;
                            flowers[fi] = {time:dmg.time, numSrc:1, x:targLoc.x, y:targLoc.y};
                        }
                    }
                }
            }

            var thisHelper = this;
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 203770)//Defiled Vines
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Defiled Vines Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 203787)//Volatile Infection
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Volatile Infection Range", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(10, "rgba(0, 255, 0, 0.6)", actor));
                            draw.sim.upperVisuals.addStates("Volatile Infection Range", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
                else if(spells[a.spellIndex].id === 205341)//seeping fog
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Seeping Fog Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }
            });
        }//for actors
        for(var fi = 0; fi < flowers.length; fi++)
        {
            draw.sim.upperVisuals.addStates("Flower", flowers[fi].time, 30000,
                generateIconOnLocation(flowerIcon, flowers[fi].x, flowers[fi].y, flowers[fi].time, 30000));
        }
    };//setupVisuals
};//initDragonsOfNightmare()

function initIlgynoth(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Ilgynoth/";
    newEncounter.mobs.push(new EncounterMob("Il'gynoth", newEncounter.filePath+"ilgynoth.jpg", true, 0, 105393));
    newEncounter.mobs.push(new EncounterMob("Eye of Il'gynoth", newEncounter.filePath+"eye.jpg", false, null, 105906));
    newEncounter.mobs.push(new EncounterMob("Dominator Tentacle", newEncounter.filePath+"tentacle.jpg", false, null, 105304));
    newEncounter.mobs.push(new EncounterMob("Deathglare Tentacle", newEncounter.filePath+"eyeTent.jpg", false, null, 105322));
    newEncounter.mobs.push(new EncounterMob("Shriveled Eyestalk", newEncounter.filePath+"eyeTent.jpg", false, null, 108821));
    newEncounter.mobs.push(new EncounterMob("Nightmare Ichor", newEncounter.filePath+"myIchor.jpg", false, null, 105721));
    newEncounter.mobs.push(new EncounterMob("Death Blossom", null, false, null, 108659));
    newEncounter.mobs.push(new EncounterMob("Nightmare Horror", newEncounter.filePath+"tankOrig.jpg", false, null, 105591));
    newEncounter.mobs.push(new EncounterMob("Corruptor Tentacle", newEncounter.filePath+"megaera.jpg", false, null, 105383));

    /*newEncounter.mobs.set("Il'gynoth",
        new EncounterMob("Il'gynoth", newEncounter.filePath+"ilgynoth.jpg", true, 0));
    newEncounter.mobs.set("Eye of Il'gynoth",
        new EncounterMob("Eye of Il'gynoth", newEncounter.filePath+"eye.jpg", false));
    newEncounter.mobs.set("Dominator Tentacle",
        new EncounterMob("Dominator Tentacle", newEncounter.filePath+"tentacle.jpg", false));
    newEncounter.mobs.set("Deathglare Tentacle",
        new EncounterMob("Deathglare Tentacle", newEncounter.filePath+"eyeTent.jpg", false));
    newEncounter.mobs.set("Corruptor Tentacle",
        new EncounterMob("Corruptor Tentacle", newEncounter.filePath+"megaera.jpg", false));
    newEncounter.mobs.set("Nightmare Horror",
        new EncounterMob("Nightmare Horror", newEncounter.filePath+"tankOrig.jpg", false));
    newEncounter.mobs.set("Nightmare Ichor",
        new EncounterMob("Nightmare Ichor", newEncounter.filePath+"myIchor.jpg", false));*/
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"ilgynothBlp.png", 0.45, -12536, 12685);
    
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(105304,30000);//dominator tentacle
        cd.addDamageWindow(105322,45000);//deathglare tentacle
        cd.addDamageWindow(105383,60000);//corruptor tentacle
    }

    newEncounter.setupVisuals = function()
    {
        this.addPhase(1,"green", 0);
        this.addGroupSpawnToTimeline(105304,30000);//dominator tentacle
        this.addGroupSpawnToTimeline(105322,45000);//deathglare tentacle
        this.addGroupSpawnToTimeline(105383,60000);//corruptor tentacle
        this.addGroupSpawnToTimeline(105591,60000);//nightmare horror

        var ilgynoth = lookupActorByID(105393)[0];//ilgynoth
        for(var ci = 0; ci < ilgynoth.casts.CA.length; ci++)
        {
            var cast = ilgynoth.casts.CA[ci];
            if(spells[cast.spellIndex].id === 210781)//dark reconstruction
            {
                this.addPhase(1, "green", cast.time+cast.castLength);
            }
        }
        var eyesOfIl = lookupActorByID(105906);//eye of il'gynoth
        for(var ei = 0; ei < eyesOfIl.length; ei++)
        {
            var sa = eyesOfIl[ei].states.SA;
            if(sa[sa.length-1] instanceof Death)
                this.addPhase(2, "yellow", sa[sa.length-1].time);
        }

        var dominators = lookupActorByID(105304);//dominator tentacle
        for(var di = 0; di < dominators.length; di++)
        {
            for(var ci = 0; ci < dominators[di].casts.CA.length; ci++)
            {
                var cast = dominators[di].casts.CA[ci];
                if(spells[cast.spellIndex].id === 208689)//ground slam
                {
                    draw.sim.lowerVisuals.addStates("Ground Slam Cone", cast.time, cast.castLength,
                        generateConeBetweenActors(dominators[di], actors[cast.target], Math.PI/10, 40, "rgba(216, 133, 17, 0.5)"));
                }
            }
        }
        var horrors = lookupActorByID(105591);//nightmare horror
        for(var hi = 0; hi < horrors.length; hi++)
        {
            for(var di = 0; di < horrors[hi].damageDone.AA.length; di++)
            {
                var dmg = horrors[hi].damageDone.AA[di];
                if(spells[dmg.spellIndex].id === 210984)//Eye of Fate
                {
                    draw.sim.lowerVisuals.addStates("Eye of Fate Beam", dmg.time, 1500,
                        generateVectorBetweenActors(horrors[hi], actors[dmg.target], 5,"rgb(150,0,0)"));
                }
            }
        }
        var ichors = lookupActorByID(105721);//nightmare ichor
        for(var ii = 0; ii < ichors.length; ii++)
        {
            for(var ci = 0; ci < ichors[ii].casts.CA.length; ci++)
            {
                var cast = ichors[ii].casts.CA[ci];
                if(spells[cast.spellIndex].id === 209471)//Nightmare Explosion
                {
                    draw.sim.lowerVisuals.addStates("Ichor Explosion", cast.time, cast.castLength,
                        generateCircleOnActor(7, "rgba(255,0,0,0.5)", ichors[ii]));
                }
            }
        }
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            var thisHelper = this;
            actor.auras.AM.forEach(function(a){
                drawRaidmarks(a, actor);
                if(spells[a.spellIndex].id === 210099)//fixate
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Ichor Fixate", auraState.time, auraState.endTime - auraState.time,
                                generateLineBetweenActors(actor, actors[a.source], "rgb(255,0,0)",1));
                        }
                    }
                }//if fixate
                else if(spells[a.spellIndex].id === 208929)//spew corruption
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Spew Corruption Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                            for(var activeTime = auraState.time+2000; activeTime < auraState.endTime+100; activeTime += 2000)
                            {
                                var loc = actor.getStateAtTime(activeTime);
                                draw.sim.lowerVisuals.addStates("Corruption Patch", activeTime, 90000, 
                                    generateCircleOnLocation(3, "rgba(240, 91, 255, 0.5)", loc.x, loc.y));
                            }
                        }
                    }
                }//if spew corruption
                else if(spells[a.spellIndex].id === 212886)//nightmareCorruption(voidzone)
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            draw.sim.lowerVisuals.addStates("Corruption Patch", auraState.time, 90000, 
                                generateCircleOnLocation(3, "rgba(240, 91, 255, 0.5)", loc.x, loc.y));
                        }
                    }
                }//if nightmare Corruption
                else if(spells[a.spellIndex].id === 215128)//cursed blood
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Cursed Blood Range", auraState.time, auraState.endTime - auraState.time, 
                                generateCircleOnActor(11, "rgba(255,102,0, 0.5)", actor));
                            draw.sim.upperVisuals.addStates("Cursed Blood Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(a, actor));
                        }
                    }
                }//if Cursed Blood
                else if(spells[a.spellIndex].id === 209469)//touch of corruption
                {
                    for(var auraStateIndex = 0; auraStateIndex < a.AA.length; auraStateIndex++)
                    {
                        var auraState = a.AA[auraStateIndex];
                        if(auraState instanceof a.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Touch of Corruption Stacks", auraState.time, auraState.endTime - auraState.time,
                                generateStackCountOnActor(a, actor, "rgb(157,0,255)"));
                        }
                    }
                }
            });//foreach aura
        }//for actors
    };//setupVisuals()
};//initIlgynoth()

function initCenarius(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Cenarius/";
    newEncounter.mobs.push(new EncounterMob("Cenarius", newEncounter.filePath+"cenarius.jpg", true, 0, 104636));

    newEncounter.mobs.push(new EncounterMob("Tormented Souls", newEncounter.filePath+"twig.jpg", false, null, 106895));//spanws wisps
    newEncounter.mobs.push(new EncounterMob("Corrupted Emerald Egg", newEncounter.filePath+"twig.jpg", false, null, 106898));//spawns drakes
    newEncounter.mobs.push(new EncounterMob("Nightmare Sapling", newEncounter.filePath+"twig.jpg", false, null, 106427));//spawns trees
    newEncounter.mobs.push(new EncounterMob("Corrupted Nature", newEncounter.filePath+"twig.jpg", false, null, 106899));//spawns dryad

    newEncounter.mobs.push(new EncounterMob("Corrupted Wisp", newEncounter.filePath+"redWisp.jpg", false, null, 106659));//red wisp
    newEncounter.mobs.push(new EncounterMob("Corrupted Wisp", newEncounter.filePath+"redWisp.jpg", false, null, 106304));//red wisp(normal?)
    //newEncounter.mobs.push(new EncounterMob("Wisp", newEncounter.filePath+"wisp.jpg", false, null, ));//green wisp

    newEncounter.mobs.push(new EncounterMob("Rotten Drake", newEncounter.filePath+"redDrake.jpg", false, null, 105494));//red drake
    newEncounter.mobs.push(new EncounterMob("Emerald Drake", newEncounter.filePath+"greenDrake.jpg", false, null, 106809));

    newEncounter.mobs.push(new EncounterMob("Nightmare Ancient", newEncounter.filePath+"redAncient.jpg", false, null, 105468));//red tree
    newEncounter.mobs.push(new EncounterMob("Cleansed Ancient", newEncounter.filePath+"ancient.jpg", false, null, 106667));//green tree

    newEncounter.mobs.push(new EncounterMob("Twisted Sister", newEncounter.filePath+"dryadRed.jpg", false, null, 105495));//red sister
    newEncounter.mobs.push(new EncounterMob("Redeemed Sister", newEncounter.filePath+"greenDryad.jpg", false, null, 106831));//green sister

    newEncounter.mobs.push(new EncounterMob("Entangling Roots", newEncounter.filePath+"brambles.jpg", false, null, 108040));//malf roots


    /*newEncounter.mobs.set("Cenarius",
        new EncounterMob("Cenarius", newEncounter.filePath+"cenarius.jpg", true, 0));

    newEncounter.mobs.set("Nightmare Sapling",//creates the trees
        new EncounterMob("Nightmare Sapling", newEncounter.filePath+"twig.jpg", false));
    newEncounter.mobs.set("Corrupted Nature",//creates the dryads
        new EncounterMob("Corrupted Nature", newEncounter.filePath+"twig.jpg", false));
    newEncounter.mobs.set("Tormented Souls",//creates the wisps
        new EncounterMob("Tormented Souls", newEncounter.filePath+"twig.jpg", false));
    newEncounter.mobs.set("Corrupted Emerald Egg",//creates the drakes
        new EncounterMob("Corrupted Emerald Egg", newEncounter.filePath+"twig.jpg", false));

    newEncounter.mobs.set("Rotten Drake",//red drake
        new EncounterMob("Rotten Drake", newEncounter.filePath+"redDrake.jpg", false));
    newEncounter.mobs.set("Emerald Drake",//green drake
        new EncounterMob("Emerald Drake", newEncounter.filePath+"greenDrake.jpg", false));

    newEncounter.mobs.set("Corrupted Wisp",//red wisp
        new EncounterMob("Corrupted Wisp", newEncounter.filePath+"redWisp.jpg", false));
    newEncounter.mobs.set("Wisp",//green wisp
        new EncounterMob("Wisp", newEncounter.filePath+"wisp.jpg", false));

    newEncounter.mobs.set("Twisted Sister",//red dryad
        new EncounterMob("Twisted Sister", newEncounter.filePath+"dryadRed.jpg", false));
    newEncounter.mobs.set("Redeemed Sister",//green dryad
        new EncounterMob("Redeemed Sister", newEncounter.filePath+"greenDryad.jpg", false));

    newEncounter.mobs.set("Nightmare Ancient",//red tree
        new EncounterMob("Nightmare Ancient", newEncounter.filePath+"redAncient.jpg", false));
    newEncounter.mobs.set("Cleansed Ancient",//green tree
        new EncounterMob("Cleansed Ancient", newEncounter.filePath+"ancient.jpg", false));

    newEncounter.mobs.set("Entangling Roots",//malfurion roots
        new EncounterMob("Entangling Roots", newEncounter.filePath+"brambles.jpg", false));*/

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"cenariusBlp.png", 0.454, 12465, -11470);
    
    newEncounter.setupCombatData = function(cd)
    {
        cd.addDamageWindow(105494, 60000);//rotten drake
        cd.addDamageWindow(106659, 60000);//corrupted wisp
        cd.addDamageWindow(105495, 60000);//twisted sister
        cd.addDamageWindow(105468, 60000);//nightmare ancient
        cd.addDamageWindow(108040);//entangling roots
    };

    newEncounter.setupVisuals = function()
    {
        var brambles = new Image();
        brambles.src = this.filePath+"brambles.jpg";

        var thisHelper = this;
        var cenarius = lookupActorByID(104636)[0];//cenarius
        var p1StartTimes = [];

        this.addGroupSpawnToTimeline(105494, 60000);//rotten drake
        this.addGroupSpawnToTimeline(106659, 60000);//corrupted wisp
        this.addGroupSpawnToTimeline(105495, 60000);//twisted sister
        this.addGroupSpawnToTimeline(105468, 60000);//nightmare ancient


        cenarius.auras.AM.forEach(function(aura){
            if(spells[aura.spellIndex].id === 210346)//aura of dread thorns
            {
                for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                {
                    var auraState = aura.AA[auraStateIndex];
                    if(auraState instanceof aura.stateApplied)
                    {
                        var range = (newEncounter.difficulty <= 1)?20:30;
                        draw.sim.lowerVisuals.addStates("Thorns Range", auraState.time, auraState.endTime - auraState.time, 
                            generateCircleOnActor(range,"rgba(100, 0, 0, 0.5)", cenarius));
                        draw.sim.upperVisuals.addStates("Thorns Icon", auraState.time, auraState.endTime - auraState.time,
                            generateAuraIconOnActor(aura, cenarius));
                    }
                }
            }//aura of dread thorns
        });//cenarius auras
        for(var di = 0; di < cenarius.damageDone.AA.length; di++)
        {
            var dmg = cenarius.damageDone.AA[di];
            if(spells[dmg.spellIndex].id === 214712)//nightmares(p2 voidzone)
            {
                var loc = actors[dmg.target].getStateAtTime(dmg.time);
                draw.sim.lowerVisuals.addStates("Nightmares voidzone", dmg.time, Number.MAX_VALUE,
                    generateCircleOnLocation(2,"rgb(188, 0, 198)", loc.x, loc.y));
            }
        }//cenarius dmg
        for(var ci = 0; ci < cenarius.casts.CA.length; ci++)
        {
            var cast = cenarius.casts.CA[ci];
            if(spells[cast.spellIndex].id === 212726)//forces of nightmare
            {
                p1StartTimes.push(cast.time);
                this.addPhase(1, p1StartTimes.length%2===1?"green":"yellow", cast.time);
            }  
        }
        for(var si = 0; si < cenarius.states.SA.length; si++)
        {
            var state = cenarius.states.SA[si];
            if(state.curHP/state.maxHP <= 0.35)
            {
                this.addPhase(2,"red", state.time);
                break;
            }
        }
        var corruptedWisps = lookupActorByID(106659);//corrupted wisp
        for(var wi = 0; wi < corruptedWisps.length; wi++)
        {
            for(var ci = 0; ci < corruptedWisps[wi].casts.CA.length; ci++)
            {
                var cast = corruptedWisps[wi].casts.CA[ci];
                if(spells[cast.spellIndex].id === 210619)//destructive nightmares
                {
                    draw.sim.lowerVisuals.addStates("Wisp Explosion", cast.time-500, 1000,
                        generateCircleOnActor(8, "rgba(255, 0, 0, xx0.6)", corruptedWisps[wi]));
                }
            }
        }
        var rottenDrakes = lookupActorByID(105494);//rotten drake
        for(var drakeI = 0; drakeI < rottenDrakes.length; drakeI++)
        {
            for(var di = 0; di < rottenDrakes[drakeI].damageDone.AA.length; di++)
            {
                var dmg = rottenDrakes[drakeI].damageDone.AA[di];
                if(spells[dmg.spellIndex].id === 211196)//rotten breath
                {
                    var castLoc = rottenDrakes[drakeI].getStateAtTime(dmg.time);
                    var targLoc = actors[dmg.target].getStateAtTime(dmg.time);
                    if(targLoc === null)
                        continue;
                    var dir = getAngleBetweenPoints(castLoc.x, castLoc.y, targLoc.x, targLoc.y);
                    draw.sim.lowerVisuals.addStates("Rotten Breath", dmg.time, 1000,
                        generateConeOnActor(rottenDrakes[drakeI], dir, Math.PI/12, 45, "rgba(255,0,0,0.6)"));
                }
            }
        }
        var nightmareAncients = lookupActorByID(105468);//nightmare ancient
        for(var ni = 0; ni < nightmareAncients.length; ni++)
        {
            for(var ci = 0; ci < nightmareAncients[ni].casts.CA.length; ci++)
            {
                var cast = nightmareAncients[ni].casts.CA[ci];
                if(spells[cast.spellIndex].id === 211073)//desiccating stomp
                {
                    draw.sim.lowerVisuals.addStates("Desiccating Stomp", cast.time, cast.castLength,
                        generateCircleOnActor(8, "rgba(255,0,0,0.6)", nightmareAncients[ni]));
                }
            }
        }
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(aura){
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 210279)//creeping nightmares
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Creeping Nightmares High Stacks", auraState.time, auraState.endTime-auraState.time,
                                generateStackCountOnActor(aura, actor, "rgb(255,255,255)", 15));
                        }
                        else if(auraState instanceof aura.stateRemoved)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            if(loc === null)
                                continue;
                            var duration = 5000;
                            for(var p1i = 1; p1i < p1StartTimes.length; p1i++)//starting at 1 so we can safely step back
                            {
                                if(p1StartTimes[p1i] > auraState.time)
                                {
                                    duration = auraState.time - p1StartTimes[p1i-1] - 7000;
                                    break;
                                }
                            }
                            draw.sim.lowerVisuals.addStates("Cleansed Ground", auraState.time-duration, duration,
                                generateCircleOnLocation(1, "rgba(0,255,0,0.6)", loc.x, loc.y));

                        }
                    }
                }//creeping nightmares
                else if(spells[aura.spellIndex].id === 211471)//Scorned Touch
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Scorned Touch Range", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(6, "rgba(139,0,198,0.6)", actor));
                            draw.sim.upperVisuals.addStates("Scorned Touch Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }//scorned touch
                else if(spells[aura.spellIndex].id === 210315)//nightmare brambles
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            draw.sim.lowerVisuals.addStates("Brambles Warning", auraState.time-5000, 5000, 
                                generateIconOnLocation(brambles, loc.x, loc.y));
                            draw.sim.upperVisuals.addStates("Brambles Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }
                else if(spells[aura.spellIndex].id === 211939)//Ancient Dream(tank guardian spirit)
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Ancient Dream Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }//ancient dream
                else if(spells[aura.spellIndex].id === 211989)//unbound touch(dryad buff)
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Unbound Touch Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }//unbound touch
            });//actor auras
        }//for actors
    };
};//initCenarius()

function initXavius(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Xavius/";

    newEncounter.mobs.push(new EncounterMob("Xavius", newEncounter.filePath+"xavius.jpg", true, 0, 103769));
    newEncounter.mobs.push(new EncounterMob("Dread Abomination", null, false, null, 105343));
    newEncounter.mobs.push(new EncounterMob("Lurking Terror", newEncounter.filePath+"lurkingTerror.jpg", false, null, 103694));
    newEncounter.mobs.push(new EncounterMob("Nightmare Blades", newEncounter.filePath+"blades.jpg", false, null, 104422));
    newEncounter.mobs.push(new EncounterMob("Inconceivable Horror", newEncounter.filePath+"tankOrig.jpg", false, null, 105611));
    newEncounter.mobs.push(new EncounterMob("Nightmare Tentacle", newEncounter.filePath+"tentacle.jpg", false, null, 104592));
    newEncounter.mobs.push(new EncounterMob("Corruption Horror", newEncounter.filePath+"Corruption Horror.jpg", false, null, 103695));


    /*newEncounter.mobs.set("Xavius",
        new EncounterMob("Xavius", newEncounter.filePath+"xavius.jpg", true, 0));
    newEncounter.mobs.set("Lurking Terror",
        new EncounterMob("Lurking Terror", newEncounter.filePath+"lurkingTerror.jpg", false));
    newEncounter.mobs.set("Nightmare Blades",//is this even needed?
        new EncounterMob("Nightmare Blades", newEncounter.filePath+"blades.jpg", false));
    newEncounter.mobs.set("Corruption Horror",
        new EncounterMob("Corruption Horror", newEncounter.filePath+"Corruption Horror.jpg", false));

    newEncounter.mobs.set("Inconceivable Horror",
        new EncounterMob("Inconceivable Horror", newEncounter.filePath+"tankOrig.jpg", false));
    newEncounter.mobs.set("Nightmare Tentacle",
        new EncounterMob("Nightmare Tentacle", newEncounter.filePath+"tentacle.jpg", false));*/
    newEncounter.mobsToIgnore = ["Dread Abomination"];
    if(draw)
        draw.sim.setMap(newEncounter.filePath+"xaviusBlp.png", 0.178, 4942, 2930);

    newEncounter.setupVisuals = function()
    {
        var xavius = lookupActorByID(103769)[0];//xavius
        var phaseCount = 0;
        for(var si = 0; si < xavius.states.SA.length; si++)
        {
            var hpPercent = xavius.states.SA[si].curHP/xavius.states.SA[si].maxHP
            if(hpPercent <= 0.95 && phaseCount === 0)
            {
                this.addPhase(1,"green", xavius.states.SA[si].time);
                phaseCount++;
            }
            else if(hpPercent <= 0.65 && phaseCount === 1)
            {
                this.addPhase(2,"yellow", xavius.states.SA[si].time);
                phaseCount++;
            }
            else if(hpPercent <= 0.3 && phaseCount === 2)
            {
                this.addPhase(3,"red", xavius.states.SA[si].time);
                break;
            }
        }
        for(var ci = 0; ci < xavius.casts.CA.length; ci++)
        {
            var cast = xavius.casts.CA[ci];
            if(spells[cast.spellIndex].id === 210264 || spells[cast.spellIndex].id === 205588)//p1 and p2 adds
            {
                draw.timeline.addCast(cast);
            }
        }
        var horrors = lookupActorByID(103695);//corruption horror
        for(var hi = 0; hi < horrors.length; hi++)
        {
            for(var di = 0; di < horrors[hi].damageDone.AA.length; di++)
            {
                var dmg = horrors[hi].damageDone.AA[di];
                if(spells[dmg.spellIndex].id === 205595)//tormenting swipe
                {
                    var castLoc = horrors[hi].getStateAtTime(dmg.time);
                    var targLoc = actors[dmg.target].getStateAtTime(dmg.time);
                    if(targLoc === null)
                        continue;
                    var dir = getAngleBetweenPoints(castLoc.x, castLoc.y, targLoc.x, targLoc.y);
                    draw.sim.lowerVisuals.addStates("Tormenting Swipe Cone", dmg.time, 1000,
                        generateConeOnActor(horrors[hi], dir, Math.PI/5, 15, "rgba(255,0,0,0.5)"));
                }
            }
        }
        var incons = lookupActorByID(105611);//inconcievable horror
        for(var ii = 0; ii < incons.length; ii++)
        {
            var sa = incons[ii].states.SA;
            if(sa.length >= 2 && sa[sa.length-1] instanceof Death)
            {
                var time = sa[sa.length-1].time-1;
                var loc = incons[ii].getStateAtTime(time);
                draw.sim.lowerVisuals.addStates("Tainted Discharge spawn", time, 5000,
                    generateCircleOnLocation(6,"rgba(255,102,196, 0.6)", loc.x, loc.y));
            }
        }
        var blades = [];
        var bonds = [];
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            actor.auras.AM.forEach(function(aura){
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 206005)//Dream Similacrum
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Dream cover", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(null, "rgba(0,255,200,0.5)", actor));
                        }
                    }
                }//if dream Similacrum
                if(spells[aura.spellIndex].id === 208385)//Tainted Discharge
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            var loc = actor.getStateAtTime(auraState.time);
                            draw.sim.lowerVisuals.addStates("Tainted Discharge entrance", auraState.time-500, auraState.endTime - auraState.time,
                                generateCircleOnLocation(4,"rgba(255,102,196, 0.6)", loc.x, loc.y));
                        }
                    }
                }//if tainted Discharge
                if(spells[aura.spellIndex].id === 224508)//Corruption Meteor
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.lowerVisuals.addStates("Corruption Meteor", auraState.time, auraState.endTime - auraState.time,
                                generateCircleOnActor(12, "rgba(150,0,0,0.5)", actor));
                            draw.sim.upperVisuals.addStates("Corruption Meteor Icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }//if corruption meteor
                else if(spells[aura.spellIndex].id === 206651 || spells[aura.spellIndex].id === 209158)//darkening/blackening soul
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Tank debuffs", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconWithStacksOnActor(aura, actor, "rgb(255,255,255)"));
                            if(spells[aura.spellIndex].id === 206651)
                            {
                                var range = (newEncounter.difficulty > 1)?25:10;
                                draw.sim.lowerVisuals.addStates("darkening soul warning",auraState.time, auraState.endTime - auraState.time,
                                    generateCircleOnActor(range, "rgba(255,0,0,0.4)", actor));
                            }
                        }
                    }
                }//if darkening/blackening soul
                else if(spells[aura.spellIndex].id === 211802)//nightmare blades
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            blades.push({state:auraState, actor:actor});
                        }
                    }
                }//if nightmare blades
                else if(spells[aura.spellIndex].id === 210451 || spells[aura.spellIndex].id === 209034)//bonds of terror
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            bonds.push({state:auraState, actor:actor});
                        }
                    }
                }//if bonds of terror             
                else if(spells[aura.spellIndex].id === 205771)//Lurking Terror fixate
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("Lurking Terror Fixate", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(aura,actor));
                            //lurking terrors dont generate enough info to track
                            /*draw.sim.lowerVisuals.addStates("Lurking Terror Fixate", auraState.time, auraState.endTime - auraState.time,
                                generateLineBetweenActors(actor, actors[aura.source], "rgb(255,0,0)", 3));*/
                        }
                    }
                }//if lurking terror fixate
            });//foreach actor auras
        }//for actors
        for(var bi = 0; bi < blades.length; bi++)//bladeIndex
        {
            for(var mi = bi+1; mi < blades.length; mi++)//matchIndex
            {
                //console.log(blades[bi].state.time +"-"+blades[mi].state.time +"~="+ Math.abs(blades[bi].state.time - blades[mi].state.time));
                if(Math.abs(blades[bi].state.time - blades[mi].state.time) < 500)
                {//match found
                    draw.sim.lowerVisuals.addStates("Blades Vector 1",
                        blades[bi].state.time, blades[bi].state.endTime - blades[bi].state.time,
                        generateVectorBetweenActors(blades[bi].actor, blades[mi].actor, 7, "rgb(255,0,0)"));
                    draw.sim.lowerVisuals.addStates("Blades Vector 2",
                        blades[bi].state.time, blades[bi].state.endTime - blades[bi].state.time,
                        generateVectorBetweenActors(blades[mi].actor, blades[bi].actor, 7, "rgb(255,0,0)"));
                    blades.splice(mi,1);
                    break;
                }
            }
        }//for blades
        for(var bi = 0; bi < bonds.length; bi++)//bondsIndex
        {
            for(var mi = bi+1; mi < bonds.length; mi++)//matchIndex
            {
                if(Math.abs(bonds[bi].state.time - bonds[mi].state.time) < 500)
                {//match found
                    var endTime = bonds[bi].state.endTime>bonds[mi].state.endTime ? bonds[bi].state.endTime : bonds[mi].state.endTime;
                    draw.sim.lowerVisuals.addStates("Bonds of Terror Link",
                        bonds[bi].state.time, endTime - bonds[bi].state.time,
                        generateLineBetweenActors(bonds[bi].actor, bonds[mi].actor, "rgb(255,144,33)", 4, null, null, true));
                    bonds.splice(mi,1);
                    break;
                }
            }
        }
    };//setupVisuals()
};//initXavius()

function initOdyn(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Odyn/";
    newEncounter.mobs.push(new EncounterMob("Odyn", newEncounter.filePath+"odyn.jpg", true, 0, 114263));
    newEncounter.mobs.push(new EncounterMob("Hymdall", newEncounter.filePath+"hymdall.jpg", false, null, 114361));
    newEncounter.mobs.push(new EncounterMob("Hyrja", newEncounter.filePath+"hyrja.jpg", false, null, 114360));
    newEncounter.mobs.push(new EncounterMob("Valarjar Runebearer", newEncounter.filePath+"odynAdd.jpg", false, null, 114996));
    newEncounter.mobs.push(new EncounterMob("Spear of Light", null, false, null, 114467));
    /*newEncounter.mobs.set("Odyn",
        new EncounterMob("Odyn", newEncounter.filePath+"odyn.jpg", true));
    newEncounter.mobs.set("Hymdall",
        new EncounterMob("Hymdall", newEncounter.filePath+"hymdall.jpg", false, 0));
    newEncounter.mobs.set("Hyrja",
        new EncounterMob("Hyrja", newEncounter.filePath+"hyrja.jpg", false, 0));
    newEncounter.mobs.set("Valarjar Runebearer",
        new EncounterMob("Valarjar Runebearer", newEncounter.filePath+"odynAdd.jpg", false));*/

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"odynRaw.png", 1.51, -1307, -3294);
    
    newEncounter.setupVisuals = function()
    {
        this.addPhase(1,"green", 0);
        
        for(var actorI = 0; actorI < actors.length; actorI++)
        {
            var actor = actors[actorI];
            if(actor.class.mobID === 114263)//odyn
            {
                var stateCount = 0;
                for(var stateI = 0; stateI < actor.states.SA.length; stateI++)
                {
                    var state = actor.states.SA[stateI];
                    if(state.curHP/state.maxHP <= 0.999 && stateCount === 0)
                    {
                        stateCount++;
                        this.addPhase(2, "yellow", state.time);
                    }
                    else if(state.curHP/state.maxHP <= 0.55 && stateCount === 1)
                    {
                        this.addPhase(3, "red", state.time);
                        break;
                    }
                }
            }
            else if(actor.class.mobID === 114996)//valarjar runebearer
            {
                actor.auras.AM.forEach(function(aura){
                    if(spells[aura.spellIndex].id === 227596 || spells[aura.spellIndex].id === 227598 ||
                        spells[aura.spellIndex].id === 227595 || spells[aura.spellIndex].id === 227594 ||
                        spells[aura.spellIndex].id === 227597)//add shields
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("Rune Shield", auraState.time, auraState.endTime-auraState.time,
                                    generateAuraIconOnActor(aura, actor));
                            }
                        }
                    }//if shield
                });//for auras
            }//if runebearer
            else if(actor.class.mobID === 114361)//hymdall
            {
                removeDowntime(actor);
                for(var castI = 0; castI < actor.casts.CA.length; castI++)
                {
                    var cast = actor.casts.CA[castI];
                    if(spells[cast.spellIndex].id === 228012)//horn of valor
                    {
                        draw.timeline.addCast(cast);
                        for(var hornI = 0; hornI < actors.length; hornI++)
                        {
                            var hornTarg = actors[hornI];
                            if(hornTarg.class instanceof PlayerClass)
                            {
                                draw.sim.lowerVisuals.addStates("Horn Range", cast.time, cast.castLength, 
                                    generateCircleOnActor(5, "rgba(255,0,0,0.5)", hornTarg));
                            }//if player
                        }//for horn targets
                    }//if Horn of Valor
                }//for casts
            }//if Hymdall
            else if(actor.class.mobID === 114360)//hyrja
            {
                removeDowntime(actor);
                for(var castI = 0; castI < actor.casts.CA.length; castI++)
                {
                    var cast = actor.casts.CA[castI];
                    if(spells[cast.spellIndex].id === 228162)//shield of light
                    {
                        draw.timeline.addCast(cast);
                        draw.sim.upperVisuals.addStates("Shield of light beam", cast.time, cast.castLength, 
                            generateVectorBetweenActors(actor, actors[cast.target], 3,"rgba(255,255,0,0.6)"));
                    }//if Horn of Valor
                }//for casts
            }//if hyrja

                actor.auras.AM.forEach(function(aura){
                    drawRaidmarks(aura, actor);
                    if(spells[aura.spellIndex].id === 227475 || spells[aura.spellIndex].id === 227781)//cleansing Flame(p3 fire), glowing fragment
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("flame/fragment icon", auraState.time, auraState.endTime-auraState.time,
                                    generateAuraIconOnActor(aura, actor));
                            }
                        }//for aura states
                    }//if fire/stun
                    else if(spells[aura.spellIndex].id === 227807)//tornado
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("tornado icon", auraState.time, auraState.endTime-auraState.time,
                                    generateAuraIconOnActor(aura, actor));
                                draw.sim.lowerVisuals.addStates("tornado player range", auraState.time, auraState.endTime-auraState.time,
                                    generateCircleOnActor(8, "rgba(0,0,255,0.5)", actor));
                                var loc = actor.getStateAtTime(auraState.endTime);
                                draw.sim.lowerVisuals.addStates("tornado drop", auraState.endTime, Number.MAX_VALUE, 
                                    generateCircleOnLocation(3, "rgba(0,0,255,0.5)",loc.x, loc.y));
                            }
                        }//for aura states
                    }//tornados
                    else if(spells[aura.spellIndex].id === 227498 || spells[aura.spellIndex].id === 227490 || //yellow purp
                        spells[aura.spellIndex].id === 227500 || spells[aura.spellIndex].id === 227491 || //green orange
                        spells[aura.spellIndex].id === 227499)//blue //add fixates
                    {
                        var color;
                        if(spells[aura.spellIndex].id === 227498)//yellow
                            color = 'rgb(255,255,0)';
                        else if(spells[aura.spellIndex].id === 227490)//purp
                            color = 'rgb(255,0,255)';
                        else if(spells[aura.spellIndex].id === 227500)//green
                            color = 'rgb(0,255,0)';
                        else if(spells[aura.spellIndex].id === 227491)//orange
                            color = 'rgb(255,130,0)';
                        else if(spells[aura.spellIndex].id === 227499)//blue
                            color = 'rgb(0,0,255)';

                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("add fixate", auraState.time, auraState.endTime-auraState.time,
                                    generateLineBetweenActors(actor, actors[aura.source], color, 4, null, null, true));
                            }
                        }//for aura states
                    }//if fixates
                    else if(spells[aura.spellIndex].id === 228029)//expel light
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                draw.sim.lowerVisuals.addStates("expel light range", auraState.time, auraState.endTime-auraState.time,
                                    generateCircleOnActor(8, "rgba(255,255,0,0.5)", actor));
                                draw.sim.upperVisuals.addStates("expel light icon", auraState.time, auraState.endTime-auraState.time,
                                    generateAuraIconOnActor(aura, actor));
                            }
                        }//for aura states
                    }//if expel light
                });//for auras
        }//for actors
    }//setupVisuals()
};//initOdyn()

function initGuarm(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Guarm/";
    newEncounter.mobs.push(new EncounterMob("Guarm", newEncounter.filePath+"guarm.jpg", true, 0, 114323));
    /*newEncounter.mobs.set("Guarm",
        new EncounterMob("Guarm", newEncounter.filePath+"guarm.jpg", true, 0));*/

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"helyaBlp.png", 1.021, -1044, -677);
    
    newEncounter.setupVisuals = function()
    {
        var breathTimes = [];
        var guarm = lookupActorByID(114323)[0];//guarm
        if(guarm !== null)
        {
            for(var castI = 0; castI < guarm.casts.CA.length; castI++)
            {
                var cast = guarm.casts.CA[castI];
                if(spells[cast.spellIndex].id === 227514)//flashing fangs
                {
                    var targ = actors[guarm.getTargetAtTime(cast.time)];
                    draw.sim.lowerVisuals.addStates("flashing fangs cone", cast.time, cast.castLength,
                        generateConeBetweenActors(guarm, targ, Math.PI/4, 25, "rgba(255,255,255,0.5)"));
                }
                else if(spells[cast.spellIndex].id === 227573)//start of split breath
                {
                    breathTimes.push(cast.time);
                    draw.timeline.addCast(cast);
                }
                else if(spells[cast.spellIndex].id === 228344)//headlong charge
                {
                    draw.timeline.addCast(cast);
                }
            }
            for(var dmgI = 0; dmgI < guarm.damageDone.AA.length; dmgI++)
            {
                var dmg = guarm.damageDone.AA[dmgI];
                if(spells[dmg.spellIndex].id === 232800 || spells[dmg.spellIndex].id === 232798 ||//shadow breath, salty spittle
                    spells[dmg.spellIndex].id === 232777)//fiery breath
                {
                    var color;
                    if(spells[dmg.spellIndex].id === 232800)//shadow
                        color = "rgb(187,0,255)";
                    else if(spells[dmg.spellIndex].id === 232798)//salty
                        color = "rgb(7,226,255)";
                    else if(spells[dmg.spellIndex].id === 232777)//fiery
                        color = "rgb(255,127,0)";

                    var guarmLoc = guarm.getStateAtTime(dmg.time);
                    var targLoc = actors[dmg.target].getStateAtTime(dmg.time);
                    var dir = getAngleBetweenPoints(guarmLoc.x, guarmLoc.y, targLoc.x, targLoc.y);
                    draw.sim.lowerVisuals.addStates("split breath", dmg.time-5000, 5000,
                        generateConeOnActor(guarm, dir, Math.PI/16, 45, color));
                }//if split breath
            }//for dmg done
        }
        for(var actorI = 0; actorI < actors.length; actorI++)
        {
            var actor = actors[actorI];
            actor.auras.AM.forEach(function(aura){
                drawRaidmarks(aura, actor);
                if(spells[aura.spellIndex].id === 228253 || spells[aura.spellIndex].id === 228248 ||//shadow lick, frost lick
                    spells[aura.spellIndex].id === 228228)//flame lick
                {
                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            draw.sim.upperVisuals.addStates("lick icon", auraState.time, auraState.endTime - auraState.time,
                                generateAuraIconOnActor(aura, actor));
                        }
                    }
                }//licks
                else if(spells[aura.spellIndex].id === 228769 || spells[aura.spellIndex].id === 228758 ||//dark discharge, firey phlegm
                    spells[aura.spellIndex].id === 228768)//salty spittle
                {
                    var color;
                    if(spells[aura.spellIndex].id === 228769)//shadow
                        color = "rgba(187,0,255,0.6)";
                    else if(spells[aura.spellIndex].id === 228768)//salty
                        color = "rgba(7,226,255,0.6)";
                    else if(spells[aura.spellIndex].id === 228758)//fiery
                        color = "rgba(255,127,0,0.6)";

                    for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                    {
                        var auraState = aura.AA[auraStateIndex];
                        if(auraState instanceof aura.stateApplied)
                        {
                            for(var breathI = 0; breathI < breathTimes.length; breathI++)
                            {
                                if(breathTimes[breathI] < auraState.time || breathTimes[breathI] > auraState.endTime)
                                    continue;
                                draw.sim.upperVisuals.addStates("debuff color", breathTimes[breathI], 5000,
                                    generateCircleOnActor(null, color, actor));
                            }
                        }
                    }
                }
            });//foreach aura
        }//for actors
    };//setupVisuals()
};//initGuarm()

function initHelya(newEncounter)
{
    newEncounter.filePath = "/icons/encounters/Nightmare/Helya/";

    newEncounter.mobs.push(new EncounterMob("Helya", newEncounter.filePath+"helya.jpg", true, 0, 114537));
    newEncounter.mobs.push(new EncounterMob("Bilewater Slime", newEncounter.filePath+"blue slime.jpg", false, null, 114553));
    newEncounter.mobs.push(new EncounterMob("Striking Tentacle", newEncounter.filePath+"tentacle.jpg", false, null, 114881));
    newEncounter.mobs.push(new EncounterMob("Gripping Tentacle", newEncounter.filePath+"tentacle.jpg", false, null, 114900));
    newEncounter.mobs.push(new EncounterMob("Helarjar Mistwatcher", newEncounter.filePath+"mistwatcher.jpg", false, null, 116335));
    newEncounter.mobs.push(new EncounterMob("Night Watch Mariner", newEncounter.filePath+"viking helmit.jpg", false, null, 114809));
    newEncounter.mobs.push(new EncounterMob("Grimelord", newEncounter.filePath+"giant.jpg", false, null, 114709));
    newEncounter.mobs.push(new EncounterMob("Decaying Minion", newEncounter.filePath+"skeleton.jpg", false, null, 114568));
    newEncounter.mobs.push(new EncounterMob("Orb of Corrosion", null, false, null, 114535));
    newEncounter.mobs.push(new EncounterMob("Orb of Corruption", null, false, null, 115166));

    /*newEncounter.mobs.set("Helya",
        new EncounterMob("Helya", newEncounter.filePath+"helya.jpg", true, 0));
    newEncounter.mobs.set("Bilewater Slime",
        new EncounterMob("Bilewater Slime", newEncounter.filePath+"blue slime.jpg", false));
    newEncounter.mobs.set("Striking Tentacle",
        new EncounterMob("Striking Tentacle", newEncounter.filePath+"tentacle.jpg", false));
    newEncounter.mobs.set("Gripping Tentacle",
        new EncounterMob("Gripping Tentacle", newEncounter.filePath+"tentacle.jpg", false));
    newEncounter.mobs.set("Grimelord",
        new EncounterMob("Grimelord", newEncounter.filePath+"giant.jpg", false));
    newEncounter.mobs.set("Night Watch Mariner",
        new EncounterMob("Night Watch Mariner", newEncounter.filePath+"viking helmit.jpg", false));
    newEncounter.mobs.set("Decaying Minion",
        new EncounterMob("Decaying Minion", newEncounter.filePath+"skeleton.jpg", false));
    newEncounter.mobs.set("Helarjar Mistwatcher",
        new EncounterMob("Helarjar Mistwatcher", newEncounter.filePath+"mistwatcher.jpg", false));*/

    if(draw)
        draw.sim.setMap(newEncounter.filePath+"helyaBlp.png", 1.155, -1113, -708);

    newEncounter.setupVisuals = function()
    {
        this.addPhase(1,"green", 0);
        var p2EndTime = 0;
        var helya = lookupActorByID(114537)[0];//helya
        var waveTimes = [];
        if(helya)
        {
            for(var stateI = 0; stateI < helya.states.SA.length; stateI++)
            {
                var state = helya.states.SA[stateI];
                if(state.curHP/state.maxHP <= 0.659)
                {
                    this.addPhase(2,"yellow", state.time);
                    break;
                }
            }
            for(var castI = 0; castI < helya.casts.CA.length; castI++)
            {
                var cast = helya.casts.CA[castI];
                draw.timeline.addCast(cast);
                if(spells[cast.spellIndex].id === 227967)//bilewater breath
                {
                    var target = actors[helya.getTargetAtTime(cast.time)];
                    draw.sim.upperVisuals.addStates("Bilewater Breath Cone", cast.time, cast.castLength,
                        generateVectorBetweenActors(helya, target, 5, "rgba(0,255,0,0.5)"));
                }
                else if(spells[cast.spellIndex].id === 228565)//corrupted breath
                {
                    var target = actors[helya.getTargetAtTime(cast.time)];
                    draw.sim.upperVisuals.addStates("Corrupted Breath Cone", cast.time, cast.castLength,
                        generateVectorBetweenActors(helya, target, 5, "rgba(165, 0, 151,0.5)"));
                }
                else if(spells[cast.spellIndex].id === 228032 || spells[cast.spellIndex].id === 228300)//wave
                {
                    waveTimes.push(cast.time+cast.castLength+5000);
                }
            }
            for(var dmgI = 0; dmgI < helya.damageDone.AA.length; dmgI++)
            {
                var dmg = helya.damageDone.AA[dmgI];
                if(spells[dmg.spellIndex].id === 228055)
                {
                    draw.sim.upperVisuals.addStates("wave flash", dmg.time, 250,
                        generateCircleOnActor(null, "rgb(0,0,255)",actors[dmg.target]));
                }
                else if(spells[dmg.spellIndex].id === 227930)//p1 orb dmg
                {
                    draw.sim.upperVisuals.addStates("p1 orb flash", dmg.time, 250,
                        generateCircleOnActor(null, "rgb(255,0,255)",actors[dmg.target]));
                }
                else if(spells[dmg.spellIndex].id === 228127)//decay dmg
                {
                    draw.sim.upperVisuals.addStates("decay flash", dmg.time, 250,
                        generateCircleOnActor(null, "rgb(0,255,0)",actors[dmg.target]));
                }
            }
        }//if helya

        for(var actorI = 0; actorI < actors.length; actorI++)
        {
            var actor = actors[actorI];

            if(actor.class.mobID === 114900)//gripping tentacle
            {
                if(actor.states.SA.length > 0)
                {
                    var state = actor.states.SA[actor.states.SA.length-1];
                    if(state instanceof Death && state.time > p2EndTime)
                    {
                        p2EndTime = state.time;
                    }
                    if(newEncounter.phases.length >= 2)
                    {
                        actor.states.SA[0].time = newEncounter.phases[1].time;
                    }
                }
            }//if gripping tentacle
            else if(actor.class.mobID === 114881)//striking tentacle
            {
                for(var castI = 0; castI < actor.casts.CA.length; castI++)
                {
                    var cast = actor.casts.CA[castI];
                    if(spells[cast.spellIndex].id === 228730)//tentacle strike
                    {
                        if(cast.time < actor.states.SA[0].time)
                            actor.states.SA[0].time = cast.time;
                    }
                }
            }
            else if(actor.class.mobID === 114568)//decaying minion
            {
                var lastState = actor.states.SA[actor.states.SA.length-1];
                var endTime = Number.MAX_VALUE;
                if(lastState)
                {
                    for(var waveI = 0; waveI < waveTimes.length; waveI++)
                    {
                        if(waveTimes[waveI] > lastState.time)
                        {
                            endTime = waveTimes[waveI];
                            break;
                        }
                    }
                    draw.sim.lowerVisuals.addStates("Decay Patch", lastState.time, endTime-lastState.time,
                        generateCircleOnLocation(6, "rgb(159, 165, 48)",lastState.x, lastState.y));
                    }
            }

                
                actor.auras.AM.forEach(function(aura){
                    drawRaidmarks(aura, actor);
                    var orbSpeed = 3.5;
                    var orbRadius = 8;
                    if(spells[aura.spellIndex].id === 229119)//p1 purple orb
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                var path = getChasePath(actor, orbSpeed, auraState.time, auraState.endTime);
                                draw.sim.upperVisuals.addStates("Orb of Corrution orb", auraState.time, auraState.endTime-auraState.time,
                                    generateChaseOrb(actor, path, orbRadius, "rgba(200,0,200, 0.6)", auraState.time, auraState.endTime));
                            }
                        }
                    }//if purple orb
                    else if(spells[aura.spellIndex].id === 230267)//p3 green orb
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                var path = getChasePath(actor, orbSpeed, auraState.time, auraState.endTime);
                                draw.sim.upperVisuals.addStates("Orb of Corrosion orb", auraState.time, auraState.endTime-auraState.time,
                                    generateChaseOrb(actor, path, orbRadius, "rgba(73,165,59, 0.8)", auraState.time, auraState.endTime));
                                for(var pathI = 0; pathI < path.length; pathI++)
                                {
                                    var endTime = Number.MAX_VALUE;
                                    for(var waveI = 0; waveI < waveTimes.length; waveI++)
                                    {
                                        if(waveTimes[waveI] > path[pathI].time)
                                        {
                                            endTime = waveTimes[waveI];
                                            break;
                                        }
                                    }
                                    draw.sim.lowerVisuals.addStates("Decay Patch", path[pathI].time, endTime-path[pathI].time,
                                        generateCircleOnLocation(orbRadius, "rgb(159, 165, 48)",path[pathI].x, path[pathI].y));
                                }
                            }
                        }
                    }//if green orb
                    else if(spells[aura.spellIndex].id === 193367 )//fetid rot
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("icon", auraState.time, auraState.endTime - auraState.time,
                                    generateAuraIconOnActor(aura, actor));
                                draw.sim.lowerVisuals.addStates("range", auraState.time, auraState.endTime - auraState.time,
                                    generateCircleOnActor(5, "RGBA(0,255,0,1)", actor));
                                    
                            }
                        }
                    }
                    else if(spells[aura.spellIndex].id === 228054)//taint of the sea
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("icon", auraState.time, auraState.endTime - auraState.time,
                                    generateAuraIconOnActor(aura, actor));
                            }
                            else if(auraState instanceof aura.stateRemoved)
                            {
                                var loc = actor.getStateAtTime(auraState.time);
                                draw.sim.lowerVisuals.addStates("taint dispell explosion", auraState.time, 2500,
                                    generateCircleOnLocation(5, "rgba(0, 200, 0, 0.6)", loc.x, loc.y));
                            }
                        }
                    }//taint of the sea
                    else if(spells[aura.spellIndex].id === 232450)//corrupted axiom
                    {
                        for(var auraStateIndex = 0; auraStateIndex < aura.AA.length; auraStateIndex++)
                        {
                            var auraState = aura.AA[auraStateIndex];
                            if(auraState instanceof aura.stateApplied)
                            {
                                draw.sim.upperVisuals.addStates("icon", auraState.time, auraState.endTime - auraState.time,
                                    generateAuraIconOnActor(aura, actor));
                            }
                        }
                    }//corrupted axiom
                });//foreach player aura
        }//for actorI
        if(p2EndTime !== 0)
        {
            this.addPhase(3, "red", p2EndTime);
        }
    };//setupVisuals()
};//initHelya()
