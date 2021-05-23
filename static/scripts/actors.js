//class, holds a snapshot of the actor's status and location
var State = function(curHPIn, maxHPIn, resIn, xIn, yIn, timeIn, SA)
{
    this.curHP = curHPIn;
    this.maxHP = maxHPIn;
    this.res = {};
    this.x = xIn;
    this.y = yIn;
    this.time = timeIn;

    if(resIn !== null && resIn.cur === 0 && resIn.max === 0 && resIn.type === 0)
        resIn = null;
    //see if the previous states were passed in
    if(SA && SA.length >= 1)
    {
        //init this state to whatever the resources were last
        var previousRes = SA[SA.length-1].res;
        var previousTypes = Object.getOwnPropertyNames(previousRes);
        for(var pi = 0; pi < previousTypes.length; pi++)
        {
            var type = previousTypes[pi]; 
            this.res[type] = {};
            this.res[type].cur = previousRes[type].cur;
            this.res[type].max = previousRes[type].max;
        }
        //if a new res is passed in
        if(resIn !== null && this.res[resIn.type] === undefined)
        {
            //add the new resource to all the old states
            this.res[resIn.type] = {};
            for(var si = 0; si < SA.length; si++)
            {
                SA[si].res[resIn.type] = {};
                SA[si].res[resIn.type].cur = resIn.cur;
                SA[si].res[resIn.type].max = resIn.max;
            }
        }
    }
    //finally init this state to the passed in resource
    if(resIn !== null)
    {
        if(resIn.type < 0 || resIn.type > 18 || (resIn.cur > resIn.max))
            console.log("corrupt res?");
        this.res[resIn.type] = {};
        this.res[resIn.type].cur = resIn.cur;
        this.res[resIn.type].max = resIn.max;
    }
    
    //function, called by the simulation to update the actor
    //actor(actor), handle to the actor to update
    this.update = function(actor)
    {
        actor.state = this.copy();
    };
    
    //function, returns a string representing the actor's state
    this.toString = function()
    {
        var str = "HP: "+this.curHP+"/"+this.maxHP+"<br>";
                /*"<br>X "+this.x+", Y "+this.y+", Time "+this.time+"<br>";*/
        var resProp = Object.getOwnPropertyNames(this.res);
        for(var ri = 0; ri < resProp.length; ri++)
        {
            str += ResourceNames[resProp[ri]]+": "+this.res[resProp[ri]].cur+"/"+this.res[resProp[ri]].max+"<br>";
        }
        return str;
    };
    
    this.copy = function()
    {
        var newState = new State(this.curHP, this.maxHP, null, this.x, this.y, this.time, null);

        var types = Object.getOwnPropertyNames(this.res);
        for(var ti = 0; ti < types.length; ti++)
        {
            var type = types[ti]; 
            newState.res[type] = {};
            newState.res[type].cur = this.res[type].cur;
            newState.res[type].max = this.res[type].max;
        }
        return newState;
    };
};

//class, state representing the time when an actor dies
//timeIn(number) time when the death occurs
var Death = function(timeIn, SA)
{
    this.time = timeIn;
    this.curHP = this.maxHP = 0 ;
    this.res = {};
    this.x = this.y = Number.MAX_VALUE * -1;

    if(SA !== null && SA.length >= 1)
    {
        var lastState = SA[SA.length - 1];
        this.maxHP = lastState.maxHP;
        this.x = lastState.x;
        this.y = lastState.y;
        var types = Object.getOwnPropertyNames(lastState.res);
        for(var ti = 0; ti < types.length; ti++)
        {
            this.res[types[ti]] = {};
            this.res[types[ti]].cur = lastState.res[types[ti]].cur;
            this.res[types[ti]].max = lastState.res[types[ti]].max;
        }
    }
    
    //function, called by the sim to update the associated actor
    //actor(actor), the actor to be updated
    this.update = function(actor)
    {
        actor.state = this.copy();
    };
    
    //function, creates a copy of this object with a new time. Mostly here to
    //match functionality of the State class.
    //newTime(number), time the state occurs
    
    //function, returns a string representing the death
    this.toString = function()
    {
        return "State: Dead at time "+ this.time+".\n";
    };
    
    this.copy = function()
    {
        var newDeath = new Death(this.time, null);
        var types = Object.getOwnPropertyNames(this.res);
        for(var ti = 0; ti < types.length; ti++)
        {
            newDeath.res[types[ti]] = {};
            newDeath.res[types[ti]].cur = this.res[types[ti]].cur;
            newDeath.res[types[ti]].max = this.res[types[ti]].max;
        }
        return newDeath;
    };
};

//class, manages the array of states for the actor, adding onto them and progressing
//through the array during simulation.
var States = function()
{
    this.SA = [];//State Array, holds all the states the actor will have
    this.deaths = [];
    this.i = 0;//index of the next state to read
    this.nextTime = Number.MAX_VALUE;//time when the next state should be read
    
    //function, called during the parse to add a new state to the actor
    //curHPIn(string) current health value
    //maxHPIn(string) max health value
    //curResIn(string) current amount of resource(mana, energy, etc)
    //maxResIn(string) maximum amount of resource
    //xIn(string) x axis position 
    //yIn(string) y axis position
    //timeIn(number) time when the state was recorded
    this.add = function(curHPIn, maxHPIn, resType, curResIn, maxResIn, xIn, yIn, timeIn)
    {
        //not a typo
        var x = parseFloat(yIn) * -1;
        var y = parseFloat(xIn) * -1;
        var res = {};
        if(resType === null || curResIn === null || maxResIn === null)
            res = null;
        else
        {
            res.type = parseInt(resType);
            res.cur = parseFloat(curResIn);
            res.max = parseFloat(maxResIn);
        }
        this.SA.push(new State(parseFloat(curHPIn), parseFloat(maxHPIn), res, x, y, timeIn, this.SA));
        //communicate to the drawing the range of xy locations it will need to display    
        if(draw)
            draw.sim.updateBounds(x, y);
    };

    this.addWithoutBounds = function(curHPIn, maxHPIn, resType, curResIn, maxResIn, xIn, yIn, timeIn)
    {
        //not a typo
        var x = parseFloat(yIn) * -1;
        var y = parseFloat(xIn) * -1;

        var res = {};
        res.type = parseInt(resType);
        res.cur = parseFloat(curResIn);
        res.max = parseFloat(maxResIn);
        
        this.SA.push(new State(parseFloat(curHPIn), parseFloat(maxHPIn), res, x, y, timeIn, this.SA));
    };
    
    //function, called durring the parse to record a death occured
    //time(number) time of the death
    this.addDeath = function(time)
    {
        var death = new Death(time, this.SA);
        this.SA.push(death);
        this.deaths.push(death);
    };
    
    //function, called after the parse is complete to make the States object ready to use
    //actor(actor) handle to the actor this is a part of to allow changes to be applied
    this.init = function(actor)
    {
        if(this.SA.length === 0)
        {
            this.nextTime = Number.MAX_VALUE;
            return;
        }
        this.i = 0;
        this.nextTime = this.SA[this.i].time;
        if(this.SA[0].time === 0)
            this.SA[0].update(actor);
        else
            actor.state = null;
    };
    
    //function, called each time the sim steps forward, checking if there is a change to the state
    //curTime(number) time in miliseconds the simulation is at
    //actor(actor) reference to the actor containing this, so changes can be made
    this.step = function(curTime, actor)
    {
        while(curTime > this.nextTime)
        {
            actor.change.state = true;
            this.SA[this.i].update(actor);
            this.i++;
            if(this.i === this.SA.length)
                this.nextTime = Number.MAX_VALUE;
            else if(this.SA[this.i] instanceof Death)
            {
                this.nextTime = this.SA[this.i].time;
                actor.state.dx = actor.state.dy = 0;
                actor.state.dTime = 1;
            }
            else
            {
                this.nextTime = this.SA[this.i].time;
                actor.state.nextX = this.SA[this.i].x;
                actor.state.nextY = this.SA[this.i].y;
                actor.state.lastX = actor.state.x;
                actor.state.lastY = actor.state.y;
                actor.state.nextTime = this.nextTime;
                
                
                actor.state.dx = actor.state.nextX - actor.state.lastX;
                actor.state.dy = actor.state.nextY - actor.state.lastY;
                actor.state.dTime = actor.state.nextTime - actor.state.time;
            }
        }
    };

    
    this.checkAndAddDeath = function(deathTime)
    {
        //see if the final state is death, if not add it
        if(this.SA.length === 0)
            return;
        var lastState = this.SA[this.SA.length-1];
        if(!(lastState instanceof Death))
        {
            if(deathTime === undefined)
            {
                this.addDeath(lastState.time);
            }
            else
            {
                if(lastState.time > deathTime)
                {
                    console.log("States.checkAndAddDeath: actor alive for longer than the deathTime passed in.");
                    this.addDeath(lastState.time);
                }
                else
                {
                    this.addDeath(deathTime);
                }
            }
        }
    };
    
    //function, unlike step, this allows for time to move backwards as well as forwards,
    //and updates the actor and its own index/nextTime accordingly.
    //time(number) time to jump to
    //actor(actor) the actor to update 
    this.skip = function(time, actor)
    {
        if(this.SA.length === 0)
            return;
        if(this.SA[0].time > time)
        {
            actor.state = null;
            actor.change.state = true;
            this.i = 0;
            this.nextTime = this.SA[0].time;
            return;
        }
        
        this.i = this.SA.binarySearch(time);
        if(this.i === null)
        {
            this.i = 0;
            this.nextTime = this.SA[0];
            actor.change.state = true;
             this.step(time, actor);
            return;
        }
        actor.state = this.SA[this.i];
        actor.change.state = true;
        if(this.i === this.SA.length-1)
            this.nextTime = Number.MAX_VALUE;
        else
            this.nextTime = this.SA[this.i].time;
        this.step(time, actor);
    };

    this.getJson = function()
    {
        if(this.SA.length === 0)
            return "[";
        var json = "[";
        var x = y = curHP = maxHP = time = 0;

        var res = {};
        var resTypes = Object.getOwnPropertyNames(this.SA[0].res);
        for(var ri = 0; ri < resTypes.length; ri++)
        {
            res[resTypes[ri]] = {};
            res[resTypes[ri]].cur = 0;
            res[resTypes[ri]].max = 0;
        }
        
        for(var i = 0; i < this.SA.length; i++)
        {
            var change = false;
            if(this.SA[i] instanceof Death)
            {
                x = y = curHP = maxHP = 0;
                json += "D"+(this.SA[i].time-time);
                time = this.SA[i].time;
                change = true;
            }
            else
            {
                if(this.SA[i].x !== x)
                {
                    json += "x"+(this.SA[i].x - x).toFixed(2)+"@";
                    x = this.SA[i].x;
                    change = true;
                }
                if(this.SA[i].y !== y)
                {
                    json += "y"+(this.SA[i].y - y).toFixed(2)+"@";
                    y = this.SA[i].y;
                    change = true;
                }
                if(this.SA[i].curHP !== curHP)
                {
                    json += "h"+(this.SA[i].curHP - curHP)+"@";
                    curHP = this.SA[i].curHP;
                    change = true;
                }
                if(this.SA[i].maxHP !== maxHP)
                {
                    json += "H"+(this.SA[i].maxHP - maxHP)+"@";
                    maxHP = this.SA[i].maxHP;
                    change = true;
                }
                for(var ri = 0; ri < resTypes.length; ri++)
                {
                    var type = resTypes[ri];
                    if((this.SA[i].res[type].cur !== res[type].cur) || i === 0)
                    {
                        json += "r"+type+":"+(this.SA[i].res[type].cur-res[type].cur)+"@";
                        res[type].cur = this.SA[i].res[type].cur;
                        change = true;
                    }
                    if((this.SA[i].res[type].max !== res[type].max) || i === 0)
                    {
                        json += "R"+type+":"+(this.SA[i].res[type].max-res[type].max)+"@";
                        res[type].max = this.SA[i].res[type].max;
                        change = true;
                    }
                }
                /*if(this.SA[i].curRes !== curRes)
                { 
                    json += "r"+(this.SA[i].curRes - curRes)+"@";
                    curRes = this.SA[i].curRes;
                    change = true;
                }
                if(this.SA[i].maxRes !== maxRes)
                {
                    json += "R"+(this.SA[i].maxRes - maxRes)+"@";
                    maxRes = this.SA[i].maxRes;
                    change = true;
                }*/
            }
            if(change)
            {
                if(this.SA[i].time !== time)
                {
                    json += "t"+(this.SA[i].time - time)+"@";
                    time = this.SA[i].time;
                    change = true;
                }
                json = json.substr(0, json.length -1);
                json += "|";
            }
        }
        return json.substr(0, json.length -1);
    };
};

//class, represents a single spell or ability use
//spellName(sring) name of the spell being cast
//didCastSucceed(boolean) true if the cast completed sucesfully, flase if it failed
//startTime(number) when the cast begins
//castLength(number) how many miliseconds the cast took to complete
var Cast = function(spellIndex, didCastSucceed, targetGuid, startTime, castLength)
{
    this.spellIndex = spellIndex;
    this.didCastSucceed = didCastSucceed;
    this.time = startTime;
    this.castLength = castLength;
    this.target = targetGuid;
    
    //function, updates the actor to the current spellcast
    //actor(actor) the object to update   
    this.update = function(actor)
    {
        actor.cast = this;
        
        if(this.target && actors[this.target] && actors[this.target].guid !== "0000000000000000")
        {
            actor.target = actors[this.target];
            actor.change.target = true;
        }
    };
    
    //function, returns a string representation of the cast
    //returns a string
    this.toString = function()
    {
        var castPercent = Number.parseInt((replayTime-this.time)*100/this.castLength);
        if(castPercent > 100)//cast done, dont show in detialed view?
            return "";
        if(isNaN(castPercent))
            castPercent = "Instant";
        else
            castPercent = castPercent + "%";


        return "Cast("+(didCastSucceed?"Ok":"Fail")+") "+spells[this.spellIndex].name + " " + castPercent;
    };
};

//class, contains all the casts an actor makes and adds new ones to the list
var Casts = function()
{
    this.CA = [];//Cast Array, stores all the completed casts
    this.i;//index to the next cast in the simluation
    this.nextTime;//time to get the next cast
    
    //used to keep track of the state of a cast durring the parse
    this.currentCastSpellIndex = this.currentCastStartTime = null;
    
    //function, called before simulation starts to setup this container
    this.init = function()
    {
        this.i = 0;
        if(this.CA[0])
            this.nextTime = this.CA[0].time;
        else
            this.nextTime = Number.MAX_VALUE;
    };
    
    //function, called by the parse when a cast is begun
    //spell(string) name of the spell being cast
    //timeOffset(number) when the cast begins
    this.start = function(spellId, spellName, timeOffset)
    {
        spellName = spellName.removeExtraQuotes();
        var spellIndex = getSpellIndexFromId(spellId, spellName);
        //if there was a unresolved castStart, old cast must have failed
        if(this.currentCastSpellIndex !== null)
        {
            var castLength = timeOffset - this.currentCastStartTime;
            if(castLength > 2000)//dont have perfect info, cap any failed casts at 2s
                castLength = 2000;
            this.CA.push(new Cast(this.currentCastSpellIndex, false, null, this.currentCastStartTime, castLength));
        }
        //save the info about the start of the cast for when it completes
        this.currentCastSpellIndex = spellIndex;
        this.currentCastStartTime = timeOffset;
    };
    
    //function, called by the parse when a spell is done being cast
    //spell(string) name of the spell being cast
    //wasCastSuccessful(boolean) true if the cast completed, false otherwise
    //timeOffset(number) time when the cast completed
    this.finish = function(spellId, spellName, wasCastSuccessful, targetGuid, timeOffset)
    {
        var castLength;
        spellName = spellName.removeExtraQuotes();
        var spellIndex = getSpellIndexFromId(spellId, spellName);
        //old cast must have been interrupted by a instant-cast, fail the old one
        //only need to fail the old cast if the currentCastName is real
        if(this.currentCastSpellIndex !== null && this.currentCastSpellIndex !== spellIndex)
        {
            castLength = timeOffset - this.currentCastStartTime;
            if(castLength > 2000)
                castLength = 2000;
            this.CA.push(new Cast(this.currentCastSpellIndex, false, null, this.currentCastStartTime, castLength));
            this.currentCastSpellIndex = this.currentCastStartTime = null;//reset state
        }
        
        //insta-cast, set castStart to now, length will be zero
        if(this.currentCastSpellIndex === null)
        {
            if(wasCastSuccessful)
                this.currentCastStartTime = timeOffset;
            else//unsuccessful instant cast, no reason to record that(gcd locked key spamming)
                return;
        }

        castLength = timeOffset - this.currentCastStartTime;
        //make sure instants are treated as instanst even if CL order gets messed up
        if(castLength < 10)
            castLength = 0;
        //if this is a failed cast, cap it's length at 2 seconds
        if(castLength > 2000 && !wasCastSuccessful)
            castLength = 2000;
        
        this.CA.push(new Cast(spellIndex, wasCastSuccessful, targetGuid, this.currentCastStartTime, castLength)) ;
        this.currentCastStartTime = this.currentCastSpellIndex = null;//clear the vars tracking the start of a cast
    };
    
    //function, called each frame of the simlulation to check if a new cast began
    //curTime(number) the current time of the sim
    //actor(actor) which actor to update
    this.step = function(curTime, actor)
    {
        while(curTime >= this.nextTime)
        {
            actor.change.cast = true;
            this.CA[this.i].update(actor);
            this.i++;
            if(this.i === this.CA.length)
            {
                this.nextTime = Number.MAX_VALUE;
            }
            else
                this.nextTime = this.CA[this.i].time;
        }
    };
    
    //function, used to skip to any point, not just stepping forward
    //time(number) when to skip to
    //actor(actor) the actor to update when the correct time is found
    this.skip = function(time, actor)
    {

        if(this.CA.length === 0)
            return;
        
        actor.change.cast = true;
        actor.change.target = true;
        actor.target = null;
        if(this.CA[0].time > time)
        {
            actor.cast = null;
            
            this.i = 0;
            this.nextTime = this.CA[0].time;
            return;
        }
        this.i = this.CA.binarySearch(time);
        if(this.i === this.CA.length-1)
            this.nextTime = Number.MAX_VALUE;
        else
            this.nextTime = this.CA[this.i].time;
        actor.cast = this.CA[this.i];
        this.step(time, actor);
    };
    
    this.getJson = function()
    {
        if(this.CA.length === 0)
            return "[";
        var lastTime = 0;
        var json = "[";
        for(var c of this.CA)
        {
            json += c.spellIndex+"@";
            json += (c.didCastSucceed?"1":"0") +"@";
            json += c.target +"@";
            json += (c.time-lastTime) + "@";
            json += c.castLength + "|";
            lastTime = c.time;
        }
        return json.substr(0, json.length-1);
    };
};

//class, represents one instance of damage or healing done by an actor
//spell(string) name of the spell that caused the effect
//targetGuid(string) the actor being targeted
//aammount(string) the magnitude of the effect
//isTageted(boolean) true if the target flag was set, false otherwise
//time(number) time the action occured
var Action = function(spell, targetGUID, ammount,  isTargeted, time)
{
    this.spellIndex = spell;
    this.ammount = ammount;
    this.target = targetGUID;
    this.isPrimaryTarget = isTargeted;
    this.time = time;
    
    //function, called durring the sim to update the actor
    //actor(actor) actor to be updated
    this.update = function(actor)
    {
        if(this.isPrimaryTarget)
        {
            actor.change.target = true;
            actor.target = actors[this.target];
        }
    };
};

//class, holds the array of actions performed by an actor and adds new ones 
var Actions = function()
{
    this.AA = [];//actions array
    this.i = 0;//index of the next action to read
    this.nextTime = Number.MAX_VALUE;//time to read the next action
    
    //function, called after parse is done to pepare this object for the sim
    this.init = function()
    {
        this.i = 0;
        if(this.AA.length >= 1)
            this.nextTime = this.AA[0].time;
        else
            this.nextTime = Number.MAX_VALUE;
    };
    
    //function, called by the parse when a new action is found
    //spell(string) name of the ability
    //targetGuid(String) the actor being targeted
    //ammount(string) the magnitude of the effect
    //isTargeted(boolean) was this targetGuid the main target
    //time(number) when did the event occur
    this.add = function(spellId, spellName, targetGUID, ammount, isTargeted, time)
    {
        var spell = getSpellIndexFromId(spellId, spellName.removeExtraQuotes());
        this.AA.push(new Action(spell, targetGUID, parseInt(ammount),  isTargeted, time));
    };
    
    //function, called each frame of the simulation to check for new information
    this.step = function(curTime, actor)
    {
        while(curTime >= this.nextTime)
        {
            
            this.AA[this.i].update(actor);
            
            this.i++;
            if(this.i === this.AA.length)
            {
                this.nextTime = Number.MAX_VALUE;
            }
            else
                this.nextTime = this.AA[this.i].time;
        }
    };
    
    //function, called to move either forward or backward in the timeline
    //time(number) time to move to
    //actor(actor) the actor to update
    this.skip = function(time, actor)
    {
        if(this.AA.length === 0)
            return;
        
        actor.change.target = true;
        actor.target = null;
        if(this.AA[0].time < time)
        {
            this.i = 0;
            this.nextTime = this.AA[0].time;
            return;
        }
        this.i = this.AA.binarySearch(time);
        this.nextTime = this.AA[this.i].time;
        
    };
    
  
    //(spell, targetGUID, ammount,  isTargeted, time)  
    this.getJson = function()
    {
        if(this.AA.length === 0)
            return "[";
        var json = "[";
        var time = 0;
        for(var a of this.AA)
        {
            json += a.spellIndex+"@";
            json += a.target+"@";
            json += a.ammount+"@";
            json += (a.isPrimaryTarget?1:0)+"@";
            json += (a.time-time)+"|";
            time = a.time;
        }
        return json.substr(0, json.length-1);
    };
};

//class, holds all the applications of a single aura from a specific actor
//auraId(string) spellID of the aura
//aruaName(String) name of the aura
//srcGuid(string) actor that applied the aura
//isBuff(boolean) true if the aura is a buff, false if it's a debuff
var Aura = function(spell, srcGuid, isBuff)
{
    //this.auraId = auraId;
    //this.auraName = auraName;
    this.spellIndex = spell;
    this.source = srcGuid;
    this.isBuff = isBuff;
    this.AA = [];//Aura Array, where all it's state changes will be stored
    this.currentApplication = null;//during parse, handle to the current application
    
    this.i = null;//during replay, which state to check next
    this.timeApplied = this.timeRemoved = null;//replay, the start and stop time for current applicaiton
    this.magnitude = this.stacks = null;//replay, stack or magnitude counts

    //funciton, parse starts the application of an aura
    //time(number) when the application occurs
    this.start = function(time)
    {
        if(this.currentApplication === null)
        {
            this.currentApplication = new this.stateApplied(time);
            this.AA.push(this.currentApplication);
        }
        else//this could be an error
        {
            //console.log("Aura.start: applying an aura that is already present, ignore?");
        }
    };
    
    //function, parse ends the current application
    //time(number) time of removal
    this.end = function(time)
    {
        if(this.currentApplication)
        {
            //end the current application
            this.currentApplication.endTime = time;
            this.currentApplication = null;
            this.AA.push(new this.stateRemoved(time));
        }
        else if(this.AA.length === 0)//active pre-pull
        {
            var a = new this.stateApplied(0);
            a.endTime = time;
            this.AA.push(a);
            this.AA.push(new this.stateRemoved(time));
        }
        else
        {
            //console.log("Aura.end: Removing an inactive aura that's already been seen, ignoring.");
        }
    };
    
    //function, parse found a new stack count for this aura
    //time(number) time of the stack change
    //stackCount(number) new stacks
    this.changeStack = function(time, stackCount)
    {
        if(this.currentApplication)
        {
            this.AA.push(new this.stateStack(time, stackCount));
        }
        else if(this.AA.length === 0)//first sign, must be active pre-pull
        {
            this.currentApplication = new this.stateApplied(0);
            this.AA.push(this.currentApplication);
            this.AA.push(new this.stateStack(time, stackCount));
        }
        else//reaching this is probabily an error
        {
            //console.log("Aura.changeStack: no active state and already been seen.");
        } 
    };
    
    //function, parse found a change in magnitude of the aura
    //time(number) time of magnitude change
    //magnitude(number) new magnitude
    this.changeMagnitude = function(time, magnitude)
    {
        if(this.currentApplication)
        {
            this.AA.push(new this.stateMagnitude(time, magnitude));
        }
        else if(this.AA.length === 0)
        {
            this.currentApplication = new this.stateApplied(0);
            this.AA.push(this.currentApplication);
            this.AA.push(new this.stateMagnitude(time, magnitude));
        }
        else
        {
            //console.log("Aura.changeMagnitude: no active state and already been seen.");
        } 
    };
    
    //function, update the aura as the simulation steps forward
    //curTime(number) time the replay is at
    //actor(actor) the object to update
    this.step = function(curTime, actor)
    {
        while(curTime >= this.nextTime)
        {
            actor.change.auras = true;
            this.AA[this.i].update(this, actor);
            this.i++;
            if(this.i === this.AA.length)
                this.nextTime = Number.MAX_VALUE;
            else
                this.nextTime = this.AA[this.i].time;
        }
    };
    
    //function, used to check if a aura is already active during the parse 
    //returns true if active, false otherwise
    this.isActive = function()
    {
        return this.currentApplication !== null;
    };
    
    //class, represents an aura being applied to the actor
    //time(number) when the application begins
    this.stateApplied = function(time)
    {
        this.time = time;
        this.endTime = null;//when the aura end is discovered, this will be updated
        
        //function, called by step(), does the work of updating state
        //aura(aura) the aura to update
        //actor(actor) the acto to apply the aura to
        this.update = function(aura, actor)
        {
            aura.timeApplied = this.time;
            aura.timeRemoved = this.endTime;
            aura.stacks = aura.magnitude = null;
            //update the actor's list of active auras
            actor.activeAuras.set(aura.spellIndex+'@'+aura.source, aura);
        };
    };
    
    //class, represents when a aura is removed from its actor
    //time(number) when the aura runs out
    this.stateRemoved = function(time)
    {
        this.time = time;
        
        //function, called by step() when a aura is removed
        //aura(aura) the aura to clear the state on
        //actor(actor) the actor to remove the aura from
        this.update = function(aura, actor)
        {
            //reset the state of the Aura
            aura.timeApplied = aura.timeRemoved = aura.stacks = aura.magnitude = null;
            actor.activeAuras.delete(aura.spellIndex+'@'+aura.source);
        };
    };
    
    //class, a change in the number of stacks of the aura
    //time(number) when the change occurs
    //stackCount(number) the new stack count
    this.stateStack = function(time, stackCount)
    {
        this.time = time;
        this.stackCount = stackCount;
        
        //function, called by step() to change the current stack count
        //aura(aura) the aura to change the stack of
        this.update = function(aura)
        {
            aura.stacks = this.stackCount;
        };
    };
    
    //class, a change in the magnitude of an auara
    //time(number) when the change occurs
    //mangitude(number) the new magnitude value
    this.stateMagnitude = function(time, magnitude)
    {
        this.time = time;
        this.magnitude = magnitude;
        
        //function, called by step() to change the magnitude of the aura
        //aura(aura) the aura to change
        this.update = function(aura)
        {
            aura.magnitude = this.magnitude;
        };
    };
    
    this.getStateAtTime = function(time)
    {
        var finalState;
        for(var state of this.AA)
        {
            if(state.time > time)
                break;
            if(state instanceof this.stateApplied)
            {
                finalState = {};
                finalState.time = state.time
                finalState.endTime = state.time;
                finalState.source = this.source;
            }
            else if(state instanceof this.stateStack)
            {
                finalState.stackCount = state.statckCount;
            }
            else if(state instanceof this.stateMagnitude)
            {
                finalState.magnitude = state.magnitude;
            }
            else if(state instanceof this.stateRemoved)
            {
                finalState = null;
            }
        }
        return finalState;
    };
    
    this.foldIn = function(newAura)
    {
        var thisI = newI = 0;
        var freshAA = [];
        var currentApplication = null;
        var nextNew = newAura.AA[0];
        var nextThis = this.AA[0];
        
        this.addNewState = function(stateToInsert, parentAura, fromNew)
        {
            if(stateToInsert.endTime !== undefined)
            {
                //first application
                if(currentApplication === null)
                {
                    currentApplication = new this.stateApplied(stateToInsert.time);
                    currentApplication.endTime = null;
                    freshAA.push(currentApplication);
                }
                else if(currentApplication.endTime !== null)
                {
                    //push the end of the old application
                    freshAA.push(new parentAura.stateRemoved(currentApplication.endTime));
                    //start a new application
                    currentApplication = new this.stateApplied(stateToInsert.time);
                    freshAA.push(currentApplication);
                }
            }
            else if(stateToInsert.stackCount !== undefined)
            {
                freshAA.push(new this.stateStack(stateToInsert.time, stateToInsert.stackCount));
            }
            else if(stateToInsert.magnitude !== undefined)
            {
                freshAA.push(new this.stateMagnitude(stateToInsert.time, stateToInsert.magnitude));
            }
            else//must be state removed
            {
                if(currentApplication !== null)
                {
                    currentApplication.endTime = stateToInsert.time;
                }
                else
                {
                    console.log("error foldIn: stateRemove encountered without a active application.");
                }
            }            
            if(fromNew)
            {
                newI++;
                if(newI < newAura.AA.length)
                    nextNew = newAura.AA[newI];
                else
                    nextNew = null;
            }
            else
            {
                thisI++;
                if(thisI < this.AA.length)
                    nextThis = this.AA[thisI];
                else
                    nextThis = null;
            }
        };
        
        //while either aura has more info
        while(nextNew !== null || nextThis !== null)
        {
            //both still have new data
            if(nextNew !== null && nextThis !== null)
            {
                //newAura comes next
                if(nextNew.time < nextThis.time)
                {
                    this.addNewState(nextNew, newAura, true);  
                }
                //thisAura comes next
                else
                {
                    this.addNewState(nextThis, this, false);
                }
            }
            //thisAura is all that's left
            else if(nextNew === null)
            {
                this.addNewState(nextThis, this, false);
            }
            //nextAura is all that's left
            else if(nextThis === null)
            {
                this.addNewState(nextNew, newAura, true);
            }
        }
        if(currentApplication.endTime === null)
        {
            console.log("warning foldIn: ending with a active current application without end, this is probabily wrong?");
            currentApplication.endTime = encounterInfo.fightLength+1;
            freshAA.push(new this.stateRemoved(encounterInfo.fightLength+1));
        }
        else
        {
            freshAA.push(new this.stateRemoved(currentApplication.endTime));
        }
        this.AA = freshAA;
    };
};

//class, holds and controls the list of auras an actor recieves durring a fight
var Auras = function()
{
    this.AM = new Map();//keeps track of what's active while the log is being parsed
    
    //function, called by the parse when a new application is found
    //auraId(string) the spell ID of the aura
    //auraName(String) the name of the aura
    //srcGuid(string) the actor that applied the aura
    //isBuff(string) "BUFF" or "DEBUFF"
    //time(number) when the event occured
    //magnitude(string)(optional) if the entry had a magnitude, record it
    this.apply = function(auraId, auraName, srcGuid,  isBuff, time, magnitude)
    {
        var a = this.getAuraFromMap(auraId, auraName, srcGuid, isBuff);
        a.start(time);
        if(magnitude !== null && magnitude !== undefined)
        {
            a.changeMagnitude(time,Number.parseInt(magnitude));
        }
    };

    //function, called by the parse when an aura is removed from the actor.
    //auraId(string) the spell ID of the aura
    //auraName(String) the name of the aura
    //srcGuid(string) the actor that applied the aura
    //isBuff(string) "BUFF" or "DEBUFF"
    //time(number) when the event occured
    this.end = function(auraId, auraName, srcGuid,  isBuff, time)
    {
        var a = this.getAuraFromMap(auraId, auraName, srcGuid, isBuff);
        if(a !== null)
            a.end(time);
        //else
        //    console.log('aura.end, skipping event');

    }; 
    
    //function, called when the parse finds a stack change on an aura
    //auraId(string) the spell ID of the aura
    //auraName(String) the name of the aura
    //srcGuid(string) the actor that applied the aura
    //isBuff(string) "BUFF" or "DEBUFF"
    //time(number) when the event occured
    this.changeStack = function(auraId, auraName, srcGuid, isBuff, stacks, time)
    {
        this.getAuraFromMap(auraId, auraName, srcGuid, isBuff).changeStack(time, Number.parseInt(stacks));
 
    };
    
    //function, called after the parse is complete, to ready the auras for use.
    //If any auras were not removed by the end of the fight, give them an end
    //time 1ms longer than the encounter.
    this.init = function()
    {
        this.AM.forEach(function(e)
        {
            e.i = 0;
            e.nextTime = e.AA[0].time;
            
            if(e.currentApplication)
            {
                e.currentApplication.endTime = encounterInfo.fightLength+1;
                e.currentApplication = null;
            }
        });
    };
    
    //function, calls step() on all auras for the actor
    this.step = function(curTime, actor)
    {
        this.AM.forEach(function(e)
        {
           e.step(curTime, actor); 
        });
    };
    
    //function, skip to any time, got lazy and just reset time to 0 and go from there.
    this.skip = function(newTime, actor)
    {
        this.AM.forEach(function(e)
        {
            e.i = 0;
            e.nextTime = e.AA[0].time;
            e.step(newTime, actor);
        });
    };
    
    //function, takes a string given by the log entry and returns ture if it says "BUFF".
    //false oterwise("DEBUFF").
    //str(string) the string to test
    //returns a boolean, true if the input is "BUFF"
    this.strToBool = function(str)
    {
        return (str.trim()==="BUFF"?true:false);
    };
    
    //function, gets a aura from the map so that the parse can add new states to it. 
    //Also creates and inserts the aura into the map if it is not already present.
    //auraId(string) the spell ID of the aura
    //auraName(String) the name of the aura
    //srcGuid(string) the actor that applied the aura(possibly missing)
    //isBuff(string) "BUFF" or "DEBUFF"
    //returns the aura that matches the input criteria
    this.getAuraFromMap = function(auraId, auraName, srcGuid, isBuff)
    {
        auraName = auraName.removeExtraQuotes();   
        var spellIndex = getSpellIndexFromId(auraId, auraName);
        isBuff = this.strToBool(isBuff);
        
        //check if this exact spell and source have already been seen
        if(this.AM.has(spellIndex+'@'+srcGuid))
        {
            return this.AM.get(spellIndex+'@'+srcGuid);
        }
        else if(srcGuid === null)
        {
            for(var b of this.AM.values())
            {
                if(b.spellIndex === spellIndex && b.isActive())
                    return b;
            }
            //no srcGuid and unable to find aura already in the map, assusme it came from the environment???
            console.log("Aura.getAuraFromMap(): unable to find aura '"+auraName+"' without srcGuid, ignoring event.");
            return null;
        }
        var a = new Aura(spellIndex, srcGuid, isBuff);
        this.AM.set(spellIndex+'@'+srcGuid, a);
        //encounterInfo.isAuraImportant(a);
        return a;
    };
    
    //for debugging
    this.lookupAura = function(auraName)
    {
        var result = [];
        this.AM.forEach(function(mapEntry)
        {
            if(spells[mapEntry.spellIndex].name.startsWith(auraName))
                result.push(mapEntry );
        });
        if(result.length === 1)
            return result[0];
        return result;
    };
    
    //for the encounter to check aura states
    this.getStateAtTime = function(auraId, time)
    {
        var stateList = [];
        for(var aura of this.AM)
        {
            //aura[0] is the map key, aura[1] is the aura object
            aura = aura[1];
            var singleState = null;
            if(spells[aura.spellIndex].id === auraId)
                singleState = aura.getStateAtTime(time);
            if(singleState)//TODO this is messed up
            {
                stateList.push(singleState)
            }
        }
        return stateList.length === 0?null:stateList;
    }
    
    this.getJson = function()
    {
        if(this.AM.size === 0)
            return "[";
        var json = "[";
        var time = 0;
        for(var aura of this.AM)
        {
            time = 0;
            aura = aura[1];
            json += "<"+aura.spellIndex + "@";
            json += aura.source + "@";
            json += (aura.isBuff?1:0)+"|";
            for(var state of aura.AA)
            {
                if(state.magnitude !== undefined)
                    json += "m"+state.magnitude+"t"+(state.time-time)+"|";
                else if(state.stackCount !== undefined)
                    json += "s"+state.stackCount+"t"+(state.time-time)+"|";
                else if(state.endTime !== undefined)
                    json += "a"+(state.time-time)+"|";
                else 
                    json += "r"+(state.time-time)+"|";

                time = state.time;
            }
            json = json.substr(0, json.length-1);
        }
        return json;
    };
};

var MiscEvents = function()
{
    this.MA = [];
    this.nextTime = Number.MAX_VALUE;
    this.i = null;

    this.init = function()
    {
        this.i = 0;
        if(this.MA.length >= 1)
        {
            this.nextTime = this.MA[0].time;
            this.MA.sort(function(a,b){
                return a.time-b.time;
            });
        }
        else
            this.nextTime = Number.MAX_VALUE;
    };

    this.addAltPowerGain = function(ammount, max, spellId, spellName, time)
    {
        this.MA.push(new this.AltPowerGain(ammount, max, getSpellIndexFromId(spellId, spellName.removeExtraQuotes()), time));
    };

    this.insertAltPowerReset = function(time)
    {
        this.MA.push(new this.AltPowerReset(time));
        this.MA.sort(function(a,b){return a.time-b.time});
    };

    this.addInterrupt = function(target, interruptedId, interruptedName, time)
    {
        this.MA.push(new this.Interrupt(target, getSpellIndexFromId(interruptedId, interruptedName), time));
    };

    this.addDispell = function(target, spellId, spellName, time)
    {
        this.MA.push(new this.Dispell(target, getSpellIndexFromId(spellId, spellName.removeExtraQuotes()), time));
    };

    this.step = function(curTime)
    {

    };
    
    this.skip = function(curTime)
    {

    };

    this.AltPowerGain = function(ammount, max, spellIndex, time)
    {
        this.ammount = ammount;
        this.max = max;
        this.spellIndex = spellIndex;
        this.time = time;

        this.getJson = function(lastTime)
        {
            return "g@"+this.ammount+"@"+this.max+"@"+this.spellIndex+"@"+(this.time-lastTime);
        };
    };

    this.AltPowerReset = function(time)
    {
        this.time = time;
        
        this.getJson = function(lastTime)
        {
            return "r@"+(this.time-lastTime);
        };
    };

    this.Interrupt = function(target, interruptedIndex, time)
    {
        this.target = target;
        this.interruptedIndex = interruptedIndex;
        this.time = time;
        
        this.getJson = function(lastTime)
        {
            return "i@"+this.target+"@"+this.interruptedIndex+"@"+(this.time-lastTime);
        };
    };

    this.Dispell = function(target, dispelledIndex, time)
    {
        this.target = target;
        this.dispelledIndex = dispelledIndex;
        this.time = time;

        this.getJson = function(lastTime)
        {
            return "d@"+this.target+"@"+this.dispelledIndex+"@"+(this.time-lastTime);
        }
    }

    this.getJson = function()
    {
        var json = "[";
        var time = 0;
        for(var mai = 0; mai < this.MA.length; mai++)
        {
            if(mai > 0)
                json += "|"
            json += this.MA[mai].getJson(time);
            time = this.MA[mai].time;
        }
        return json;
    }
};

//class, holds the current state and lists of actions of a actor in the encounter
var Actor = function(GUID, name)
{
    this.guid = GUID;//guid that identifies the actor
    this.name = name;//name of the actor
    this.serverName = "";//save the servername when it gets truncated off
    this.states = new States();//object to control adding and stepping through states
    this.casts = new Casts();
    this.class = null;
    this.damageDone = new Actions();
    this.healingDone = new Actions();
    this.miscEvents = new MiscEvents();
    this.auras = new Auras();
    this.state = null;//current state
    this.cast = null;
    this.target = null;
    this.activeAuras = null;
    
    
    this.change = {};
    this.change.cast = false;
    this.change.target = false;
    this.change.state = false;
    this.change.auras = false;
    
    this.init = function()
    {
        this.states.init(this);
        this.casts.init();
        this.damageDone.init();
        this.healingDone.init();
        this.activeAuras = new Map();
        this.auras.init(this);
        this.miscEvents.init();
        this.cast = null;
        this.target = null;
    };
    
    this.step = function(time)
    {
        this.change.cast = this.change.target = this.change.state = this.change.auras = false;
        this.casts.step(time, this);
        this.damageDone.step(time, this);
        this.healingDone.step(time, this);
        this.states.step(time, this);
        this.auras.step(time, this); 
        this.miscEvents.step(time, this);
        if(this.state === null)
            return;
        if(options.movementStyle === 0)
        {
            this.state.x = this.state.lastX;
            this.state.y = this.state.lastY;
        }
        else if(options.movementStyle === 1)
        {
            if(this.state.nextTime !== undefined)
            {
                var percent = -1*(this.state.nextTime - time - this.state.dTime)/this.state.dTime;
                this.state.x = this.state.lastX + (this.state.dx*percent);
                this.state.y = this.state.lastY + (this.state.dy*percent);
            } 
        }
    };
    
    this.skip = function(time)
    {
        this.change.cast = this.change.target = this.change.state = this.change.auras = true;
        this.states.skip(time, this);
        this.casts.skip(time, this);
        this.damageDone.skip(time, this);
        this.healingDone.skip(time, this);
        this.miscEvents.skip(time, this);
        this.activeAuras = new Map();
        this.auras.skip(time, this);
    };
    
    this.getStateAtTime = function(time)
    {
        if(this.states.SA.length === 0)
            return new State(0, 0, null, Number.MAX_VALUE*-1, Number.MAX_VALUE*-1, 0);
        if(time <= this.states.SA[0].time)
            return this.states.SA[0];
        for(var i = 1; i < this.states.SA.length-1; i++)
        {
            if(this.states.SA[i].time > time)
            {
                var prev = this.states.SA[i-1];
                var next = this.states.SA[i];
                var dTime = next.time - prev.time;
                var percent = -1*(next.time - time - dTime)/dTime;
                var result = prev.copy();
                result.x += (next.x-prev.x)*percent;
                result.y += (next.y-prev.y)*percent;
                return result;
            }
        }
        return this.states.SA[i];
    };

    this.getTargetAtTime = function(checkTime)
    {
        var castTarget = {time:-1};
        var dmgTarget = {time:-1};
        var healTarget = {time:-1};
        for(var ci = 0; ci < this.casts.CA.length; ci++)
        {
            var cast = this.casts.CA[ci];
            if(cast.time > checkTime)
                break;
            if(cast.target !== 0)
                castTarget = cast;
        }
        for(var di = 0; di < this.damageDone.AA.length; di++)
        {
            var dmg = this.damageDone.AA[di];
            if(dmg.time > checkTime)
                break;
            if(dmg.isPrimaryTarget)
                dmgTarget = dmg;
        }
        for(var hi = 0; hi < this.healingDone.AA.length; hi++)
        {
            var heal = this.healingDone.AA[hi];
            if(heal.time > checkTime)
                break;
            if(heal.isPrimaryTarget)
                healTarget = heal;
        }
        if(castTarget.time > dmgTarget.time && castTarget.time > healTarget.time)
        {
            return castTarget.target;
        }
        else if(dmgTarget.time > castTarget.time && dmgTarget.time > healTarget.time)
        {
            return dmgTarget.target;
        }
        else if(healTarget.time > castTarget.time && healTarget.time > dmgTarget.time)
        {
            return healTarget.target;
        }
        else
            return null;
    };
    
    this.getAuraStateNow = function(auraId)
    {
        for(var aura of this.activeAuras)
        {
            aura = aura[1];
            if(spells[aura.spellIndex].id === auraId)
                return aura;
        }
        return false;
    };

    this.addAltPowerToRes = function()
    {
        var si = 0, mi = 0, state = null, misc = null;;
        var curAltPower = 0;
        var maxAltPower = 0;
        if(this.states.SA.length === 0)
            return;
        if(this.miscEvents.MA.length === 0)
            return;
        if(this.states.SA[0].res[10] !== undefined)
            return;
        //init maxAltPower
        for(mi = 0; mi < this.miscEvents.MA.length; mi++)
        {
            misc = this.miscEvents.MA[mi];
            if(misc instanceof this.miscEvents.AltPowerGain)
            {
                maxAltPower = misc.max;
                break;
            }
        }
        if(maxAltPower === null)
            return;

        for(si = 0; si < this.states.SA.length; si++)
        {
            state = this.states.SA[si];
            for(mi; mi < this.miscEvents.MA.length;mi++)
            {
                //TODO: some loss of fidelity here, if multiple AP changes happen between states
                misc = this.miscEvents.MA[mi];
                if(misc.time > state.time)
                    break;
                if(misc instanceof this.miscEvents.AltPowerGain)
                {
                    curAltPower += misc.ammount;
                }
                else if(misc instanceof this.miscEvents.AltPowerReset)
                {
                    curAltPower = 0;
                }

                if(curAltPower > maxAltPower)
                    curAltPower = maxAltPower;
            }
            state.res[10] = {};
            state.res[10].cur = curAltPower;
            state.res[10].max = maxAltPower;
        }
    };
    
    this.toString = function()
    {
        var s = "Name: "+this.name+"\n";
        if(this.state)
            s = s + this.state + "\n";
        if(this.cast)
            s = s + this.cast + "\n";
        if(this.target)
            s = s + "Target: "+this.target+ "\n";
        for(var a of this.activeAuras.values())
            s = s + a + "\n";
        return s;
    };
    
    this.getJson = function()
    {
        var tmp;
        var json = "";
        json += "{";
        json += this.guid + "@";
        json += this.name;
        if(this.class instanceof PlayerClass)
            json += "@"+this.class.listIndex;

        tmp = this.states.getJson();
        if(tmp === undefined || tmp === null || tmp === '' || tmp.length === 0){
            console.log("actor.getjson: Problem writing states");
            tmp = '[';
        }
        json += tmp;

        tmp = this.casts.getJson();
        if(tmp === undefined || tmp === null || tmp === '' || tmp.length === 0){
            console.log("actor.getjson: Problem writing casts");
            tmp = '[';
        }
        json += tmp;


        tmp = this.damageDone.getJson();
        if(tmp === undefined || tmp === null || tmp === '' || tmp.length === 0){
            console.log("actor.getjson: Problem writing dmgDone");
            tmp = '[';
        }
        json += tmp;

        tmp = this.healingDone.getJson();
        if(tmp === undefined || tmp === null || tmp === '' || tmp.length === 0){
            console.log("actor.getjson: Problem writing healingDone");
            tmp = '[';
        }
        json += tmp;

        tmp = this.auras.getJson();
        if(tmp === undefined || tmp === null || tmp === '' || tmp.length === 0){
            console.log("actor.getjson: Problem writing auras");
            tmp = '[';
        }
        json += tmp;

        tmp = this.miscEvents.getJson();
        if(tmp === undefined || tmp === null || tmp === '' || tmp.length === 0){
            console.log("actor.getjson: Problem writing miscEvents");
            tmp = '[';
        }
        json += tmp;

        return json;
    };
};

//to make debugging easier
function lookupActor(name)
{
    var result = [];
    actors.forEach(function(a){
        if(a.name.startsWith(name))
            result.push(a);
    });
    result.sort(function(a,b){
        return b.states.SA.length - a.states.SA.length;
    });
    return result;
};

function lookupActorByID(id)
{
    var result = [];
    for(var ai = 0; ai < actors.length; ai++)
    {
        var actor = actors[ai];
        if(actor.class.mobID === id)
        {
            result.push(actor);
        }
    }
    result.sort(function(a,b){return b.states.SA.length - a.states.SA.length;});
    return result;
};
function lookupActorByGUID(guid)
{
    var result = [];
    for(var ai = 0; ai < actors.length; ai++)
    {
        var actor = actors[ai];
        if(actor.guid === guid)
        {
            result.push(actor);
        }
    }
    result.sort(function(a,b){return b.states.SA.length - a.states.SA.length;});
    return result;
};


function initActors()
{
    //actors.forEach(function(a)
    if(actors[0] && encounterInfo)
        actors[0].class = encounterInfo.mobs[0];

    for(var ai = 1; ai < actors.length; ai++)
    {
        var a = actors[ai];
        if(a.guid.startsWith("Player"))
        {
            if(a.class === null)
            {
                console.log("InitActors() error: player with null class: "+a.guid);
                a.class = encounterInfo.mobs[1];//unidentified mob class
            }
            if(a.name.indexOf('-') !== -1)
            {
                a.serverName = a.name.split('-')[1];//TODO: azjol-nerub will break maybe
                a.name = a.name.substr(0, a.name.indexOf('-'));//remove realm name
            }
            if(a.states.SA.length > 0)
                a.states.SA[0].time = 0;
            for(var d of a.states.deaths)
            {
                draw.timeline.addDeath(a.class.color, d.time);
            }
        }
        else//not a player, and i'm ignoring pets for now, must be a hostile mob
        {
            encounterInfo.identifyActor(a);
            if(a.states.SA.length > 0 && a.class.startTime !== null)
            {
                if(a.states.SA[0].time < a.class.startTime)
                    console.log("Warning: trying to set start time on '"+a.name+"' but it's active before then.");
                else
                    a.states.SA[0].time = a.class.startTime;
            }
            a.states.checkAndAddDeath();
        }
        a.init();
    }
};

function parseJsonActor0(jsonString)
{
    var jaParts = jsonString.split("[");
    if(jaParts.length !== 6)//sanity check
    {
        console.log("parseJsonActor0: unexpected actor format");
        return;
    }
    //save the name and guid
    var names = jaParts[0].split("@");
    var actor = new Actor(names[0],names[1]);
    var ignoreBounds = false;
    if(names.length === 3)
        actor.class = playerClassList[parseInt(names[2])];
    for(var mobIndex = 0; mobIndex < encounterInfo.mobsToIgnore.length; mobIndex++)
    {
        //the new name is bad, do not change the actor
        if(encounterInfo.mobsToIgnore[mobIndex] === name)
            ignoreBounds = true;
    }
    actors.push(actor);
    //split the states into individual parts
    var jStates = jaParts[1].split("|");
    var x = y = h = H = time = 0;
    
    for(var js of jStates)
    {
        if(js === "")
            continue;
        //each js only has the parts that changed
        var stateParts = js.split("@");
        if(stateParts[0][0] === 'D')
        {
            
            //time += parseInt(stateParts[0].substr(1));
            var tempTime = parseInt(stateParts[0].substr(1));
            if(isNaN(tempTime))
                tempTime = 0;
            time += tempTime;
            actor.states.addDeath(time);
            x = y = h = H = 0;
            continue;
        }
        for(var part of stateParts)
        {
            if(part[0] === 'x')
            {
                x += parseFloat(part.substr(1));
            }
            else if(part[0] === 'y')
            {
                y += parseFloat(part.substr(1));
            }
            else if(part[0] === 'h')
            {
                h += parseInt(part.substr(1));
            }
            else if(part[0] === 'H')
            {
                H += parseInt(part.substr(1));
            }
            else if(part[0] === 't')
            {
                time += parseInt(part.substr(1));
            }
        }
        actor.states.SA.push(new State(h, H, null, x, y , time, null));
        if(!ignoreBounds)
            draw.sim.updateBounds(x,y);
    }//for jSates
    time = 0;
    var jCasts = jaParts[2].split("|");
    for(var jc of jCasts)
    {
        if(jc === "")
            continue;
        //var Cast = function(spellIndex, didCastSucceed, targetGuid, startTime, castLength)
        jc = jc.split("@");
        time += parseInt(jc[3]);
        actor.casts.CA.push(new Cast(parseInt(jc[0]),(jc[1]==='1'?true:false),
            parseInt(jc[2]),time,parseInt(jc[4])));
    }
    
    time = 0;
    var jDamage = jaParts[3].split("|");
    for(var jd of jDamage)
    {
        if(jd === "")
            continue;
        jd = jd.split("@");
        time += parseInt(jd[4]);
        actor.damageDone.AA.push(new Action(parseInt(jd[0]),parseInt(jd[1]),
            parseInt(jd[2]),(jd[3]==='1'?true:false),time));
    }
    
    time = 0;
    var jHealing = jaParts[4].split("|");
    for(var jh of jHealing)
    {
        if(jh === "")
            continue;
        jh = jh.split("@");
        time += parseInt(jh[4]);
        actor.healingDone.AA.push(new Action(parseInt(jh[0]),parseInt(jh[1]),
            parseInt(jh[2]),(jh[3]==='1'?true:false),time));
    }
    
    var jAuras = jaParts[5].split("<");
    for(var aurasIndex = 1; aurasIndex < jAuras.length; aurasIndex++)
    {
        var jAuraStates = jAuras[aurasIndex].split("|");
        var spellSourceBuff = jAuraStates[0].split("@");
        if(spellSourceBuff.length !== 3)
            continue;
        spellSourceBuff[0] = parseInt(spellSourceBuff[0]);
        spellSourceBuff[1] = parseInt(spellSourceBuff[1]);
        spellSourceBuff[2] = (spellSourceBuff[2]==='1')?true:false;
        var newAura = new Aura(spellSourceBuff[0], spellSourceBuff[1], spellSourceBuff[2]);
        actor.auras.AM.set(spellSourceBuff[0]+"@"+spellSourceBuff[1], newAura);
        time = 0;
        for(var j = 1; j < jAuraStates.length; j++)
        {
            if(jAuraStates[j][0] === 'a')
            {
                time += parseInt(jAuraStates[j].substr(1));
                newAura.start(time);
            }
            else if(jAuraStates[j][0] === 'r')
            {
                time += parseInt(jAuraStates[j].substr(1));
                newAura.end(time);
            }
            else if(jAuraStates[j][0] === 'm')
            {
                var split = jAuraStates[j].split('t');
                time += parseInt(split[1]);
                newAura.changeMagnitude(time, parseInt(split[0].substr(1)));
            }
            else if(jAuraStates[j][0] === 's')
            {
                var split = jAuraStates[j].split('t');
                time += parseInt(split[1]);
                newAura.changeStack(time, parseInt(split[0].substr(1)));
            }
        }
    }
};

function parseJsonActor1(jsonString)
{
    var jaParts = jsonString.split("[");
    if(jaParts.length !== 7)//sanity check
    {
        console.log("parseJsonActor1: unexpected actor format");
        return;
    }
    //save the name and guid
    var names = jaParts[0].split("@");
    var actor = new Actor(names[0],names[1]);
    var ignoreBounds = false;
    if(names.length === 3)
        actor.class = playerClassList[parseInt(names[2])];
    for(var mobIndex = 0; mobIndex < encounterInfo.mobsToIgnore.length; mobIndex++)
    {
        //the new name is bad, do not change the actor
        if(encounterInfo.mobsToIgnore[mobIndex] === name)
            ignoreBounds = true;
    }
    actors.push(actor);
    //split the states into individual parts
    var jStates = jaParts[1].split("|");
    var x = y = h = H = time = 0;
    var res = {};
    //find what the res types are for this actor
    for(var si = 0; si < jStates.length; si++)
    {
        var js = jStates[si];
        if(js.startsWith("D"))
            continue;
        else
        {
            js = js.split("@");
            for(var splitI = 0; splitI < js.length; splitI++)
            {
                var part = js[splitI];
                if(part[0] === 'R')
                {
                    var resType = parseInt(part.substr(1));
                    res[resType] = {};
                    res[resType].cur = res[resType].max = 0;
                }
            }
            break;//found the res data, quit and begin reading for real
        }//else
    }//for - finding res types
    var resPropNames = Object.getOwnPropertyNames(res);

    for(var js of jStates)
    {
        if(js === "")
            continue;
        //each js only has the parts that changed
        var stateParts = js.split("@");
        if(stateParts[0][0] === 'D')
        {
            
            //time += parseInt(stateParts[0].substr(1));
            var tempTime = parseInt(stateParts[0].substr(1));
            if(isNaN(tempTime))
                tempTime = 0;
            time += tempTime;
            actor.states.addDeath(time);
            x = y = h = H = 0;
            continue;
        }
        for(var part of stateParts)
        {
            if(part[0] === 'x')
            {
                x += parseFloat(part.substr(1));
            }
            else if(part[0] === 'y')
            {
                y += parseFloat(part.substr(1));
            }
            else if(part[0] === 'h')
            {
                h += parseInt(part.substr(1));
            }
            else if(part[0] === 'H')
            {
                H += parseInt(part.substr(1));
            }
            else if(part[0] === 't')
            {
                time += parseInt(part.substr(1));
            }
            else if(part[0] === 'r')
            {
                var resType = parseInt(part.substr(1));
                var resVal = parseInt(part.substr(part.indexOf(':')+1));
                res[resType].cur += resVal;
            }
            else if(part[0] === 'R')
            {
                var resType = parseInt(part.substr(1));
                var resVal = parseInt(part.substr(part.indexOf(':')+1));
                res[resType].max += resVal;
            }
        }
        var newState = new State(h, H, null, x, y , time, null);
        var newRes = {};
        for(var ri = 0; ri < resPropNames.length; ri++)
        {
            newRes[resPropNames[ri]] = {};
            newRes[resPropNames[ri]].cur = res[resPropNames[ri]].cur;
            newRes[resPropNames[ri]].max = res[resPropNames[ri]].max;
        }
        newState.res = newRes;
        actor.states.SA.push(newState);
        if(!ignoreBounds)
            draw.sim.updateBounds(x,y);
    }//for jSates

    time = 0;
    var jCasts = jaParts[2].split("|");
    for(var jc of jCasts)
    {
        if(jc === "")
            continue;
        //var Cast = function(spellIndex, didCastSucceed, targetGuid, startTime, castLength)
        jc = jc.split("@");
        time += parseInt(jc[3]);
        actor.casts.CA.push(new Cast(parseInt(jc[0]),(jc[1]==='1'?true:false),
            parseInt(jc[2]),time,parseInt(jc[4])));
    }
    
    time = 0;
    var jDamage = jaParts[3].split("|");
    for(var jd of jDamage)
    {
        if(jd === "")
            continue;
        jd = jd.split("@");
        time += parseInt(jd[4]);
        actor.damageDone.AA.push(new Action(parseInt(jd[0]),parseInt(jd[1]),
            parseInt(jd[2]),(jd[3]==='1'?true:false),time));
    }
    
    time = 0;
    var jHealing = jaParts[4].split("|");
    for(var jh of jHealing)
    {
        if(jh === "")
            continue;
        jh = jh.split("@");
        time += parseInt(jh[4]);
        actor.healingDone.AA.push(new Action(parseInt(jh[0]),parseInt(jh[1]),
            parseInt(jh[2]),(jh[3]==='1'?true:false),time));
    }
    
    var jAuras = jaParts[5].split("<");
    for(var aurasIndex = 1; aurasIndex < jAuras.length; aurasIndex++)
    {
        var jAuraStates = jAuras[aurasIndex].split("|");
        var spellSourceBuff = jAuraStates[0].split("@");
        if(spellSourceBuff.length !== 3)
            continue;
        spellSourceBuff[0] = parseInt(spellSourceBuff[0]);
        spellSourceBuff[1] = parseInt(spellSourceBuff[1]);
        spellSourceBuff[2] = (spellSourceBuff[2]==='1')?true:false;
        var newAura = new Aura(spellSourceBuff[0], spellSourceBuff[1], spellSourceBuff[2]);
        actor.auras.AM.set(spellSourceBuff[0]+"@"+spellSourceBuff[1], newAura);
        time = 0;
        for(var j = 1; j < jAuraStates.length; j++)
        {
            if(jAuraStates[j][0] === 'a')
            {
                time += parseInt(jAuraStates[j].substr(1));
                newAura.start(time);
            }
            else if(jAuraStates[j][0] === 'r')
            {
                time += parseInt(jAuraStates[j].substr(1));
                newAura.end(time);
            }
            else if(jAuraStates[j][0] === 'm')
            {
                var split = jAuraStates[j].split('t');
                time += parseInt(split[1]);
                newAura.changeMagnitude(time, parseInt(split[0].substr(1)));
            }
            else if(jAuraStates[j][0] === 's')
            {
                var split = jAuraStates[j].split('t');
                time += parseInt(split[1]);
                newAura.changeStack(time, parseInt(split[0].substr(1)));
            }
        }
    }

    var time = 0;
    var jMisc = jaParts[6].split("|");
    for(var jmi = 0; jmi < jMisc.length; jmi++)
    {
        if(jMisc[jmi] === "")
            continue;
        var miscParts = jMisc[jmi].split("@");
        if(miscParts[0] === 'g')
        {
            time += parseInt(miscParts[4]);
            actor.miscEvents.MA.push(new actor.miscEvents.AltPowerGain(parseInt(miscParts[1]),parseInt(miscParts[2]),parseInt(miscParts[3]),time));
        }
        else if(miscParts[0] === 'r')
        {
            time += parseInt(miscParts[1]);
            actor.miscEvents.MA.push(new actor.miscEvents.AltPowerReset(time));
        }
        else if(miscParts[0] === 'i')
        {
            time += parseInt(miscParts[3]);
            actor.miscEvents.MA.push(new actor.miscEvents.Interrupt(parseInt(miscParts[1]), parseInt(miscParts[2]), time));
        }
        else if(miscParts[0] === 'd')
        {
            time += parseInt(miscParts[3]);
            actor.miscEvents.MA.push(new actor.miscEvents.Dispell(parseInt(miscParts[1]), parseInt(miscParts[2]), time));
        }
        else
        {
            console.log("parseJsonActor1: unrecognized misc event: "+jMisc[jmi]);
        }
    }
};