var generateCircleOnActor = function(radius, color, actor)
{
    return function(sim)
    {
        if(!actor.state)
            return;
        
        //no radius, default to size of icon
        var finalRadius;
        if(radius === null)
            finalRadius = options.simActorSize/2;
        else
            finalRadius = radius*sim.scale;
        
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        sim.ctx.fillStyle = color;
        sim.ctx.beginPath();
        sim.ctx.arc(loc.x, loc.y, finalRadius, 0, 2*Math.PI);
        sim.ctx.closePath();
        sim.ctx.fill();

    };
};

var generateCircleGradientOnActor = function(radius, color, actor)
{
    return function(sim)
    {
        if(!actor.state)
            return;
        
        //no radius, default to size of icon
        var finalRadius;
        if(radius === null)
            finalRadius = options.simActorSize/2;
        else
            finalRadius = radius*sim.scale;
        
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);

        var gradient = sim.ctx.createRadialGradient(loc.x, loc.y, 0, loc.x, loc.y, finalRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(0,0,0,0");
        sim.ctx.fillStyle = gradient;
        sim.ctx.beginPath();
        sim.ctx.arc(loc.x, loc.y, finalRadius, 0, 2*Math.PI);
        sim.ctx.closePath();
        sim.ctx.fill();

    };
};

var generateCircleOnLocation = function(radius, color, x, y)
{
    return function(sim)
    {
        var loc = sim.getCanvasCoords(x,y);

        sim.ctx.fillStyle = color;
        sim.ctx.beginPath();
        sim.ctx.arc(loc.x, loc.y, radius*sim.scale, 0, 2*Math.PI);
        sim.ctx.closePath();
        sim.ctx.fill();

    };
};

var generateDistanceFromPoint = function(actor, x, y, textColor)
{
    return function(sim)
    {
        if(!actor.state)
            return;

        var w = options.simActorSize * 0.8;
        var h = options.simActorSize * 0.8;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        loc.x = loc.x - w*0.5;
        loc.y = loc.y - h*0.5;

        if(sim.aurasOnActors[actor.guid] === undefined)
            sim.aurasOnActors[actor.guid] = 1;
        else
        {
            loc.x += sim.aurasOnActors[actor.guid]*w;
            sim.aurasOnActors[actor.guid]++;
        }
        
        var dx = actor.state.x - x;
        var dy = actor.state.y - y;
        var dist = Math.floor(Math.sqrt(dx*dx + dy*dy));
        loc.y += h*0.8;
        
        sim.ctx.font = Math.floor(w* 0.8)+"px Arial";  
        sim.ctx.fillStyle = textColor;
        turnShadowsOn(sim.ctx, 4, true);
        sim.ctx.fillText(""+dist,loc.x,loc.y);
        turnShadowsOff(sim.ctx);
    };
};

var generateAuraIconOnActor = function(aura, actor)
{
    return function(sim)
    {
        if(!actor.state)
            return;
        //iconCache.drawIcon(aura.spellIndex, );
        var icon = spells[aura.spellIndex].getIcon();
        
        var percentComplete = (replayTime - aura.timeApplied)/(aura.timeRemoved - aura.timeApplied);
        var w = options.simActorSize * 0.8;
        var h = options.simActorSize * 0.8;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var x = loc.x - w*0.5;
        var y = loc.y - h*0.5;
        
        if(sim.aurasOnActors[actor.guid] === undefined)
            sim.aurasOnActors[actor.guid] = 1;
        else
        {
            x += sim.aurasOnActors[actor.guid]*w;
            sim.aurasOnActors[actor.guid]++;
        }
            
        sim.ctx.drawImage(icon, x, y, w, h);
        sim.ctx.save();
        sim.ctx.beginPath();
        sim.ctx.clip(sim.ctx.rect(x,y,w,h));
        sim.ctx.fillStyle = "rgba(0,0,0,0.6)";
        sim.ctx.beginPath();
        sim.ctx.moveTo(x+(h/2),y+(w/2));
        sim.ctx.arc(x+(h/2), y+(w/2), w*0.71, Math.PI*-0.5 ,Math.PI*(2*percentComplete-0.5));
        sim.ctx.moveTo(0,0);
        sim.ctx.fill();
        sim.ctx.restore(); 
    };
};

var generateCastOnActor = function(cast, actor)
{
    return function(sim)
    {
        if(!actor.state)
            return;
        var icon = spells[cast.spellIndex].getIcon();
        var percentComplete = (replayTime-cast.time)/(cast.castLength||1000);
        percentComplete = 1-percentComplete;
        var w = options.simActorSize * 0.8;
        var h = options.simActorSize * 0.8;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var x = loc.x - w*0.5;
        var y = loc.y - h*0.5;
        
        if(sim.aurasOnActors[actor.guid] === undefined)
            sim.aurasOnActors[actor.guid] = 1;
        else
        {
            x += sim.aurasOnActors[actor.guid]*w;
            sim.aurasOnActors[actor.guid]++;
        }
            
        sim.ctx.drawImage(icon, x, y, w, h);
        sim.ctx.save();
        sim.ctx.beginPath();
        sim.ctx.clip(sim.ctx.rect(x,y,w,h));
        sim.ctx.fillStyle = cast.didCastSucceed?"rgba(0,0,0,0.6)":"rgba(255,0,0,0.6)";
        sim.ctx.beginPath();
        sim.ctx.moveTo(x+(h/2),y+(w/2));
        sim.ctx.arc(x+(h/2), y+(w/2), w*0.71, Math.PI*-0.5 ,Math.PI*(2*percentComplete-0.5));
        sim.ctx.moveTo(0,0);
        sim.ctx.fill();
        sim.ctx.restore(); 
    };
}

var generateAuraIconWithStacksOnActor = function(aura, actor, textColor, dontShowCooldown)
{
    textColor = textColor || "rgb(255,255,255)";
    return function(sim)
    {
        if(!actor.state)
            return;
        
        var icon = spells[aura.spellIndex].getIcon();
        var percentComplete = (replayTime - aura.timeApplied)/(aura.timeRemoved - aura.timeApplied);
        var w = options.simActorSize * 0.8;
        var h = options.simActorSize * 0.8;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var x = loc.x - w*0.5;
        var y = loc.y - h*0.5;

        if(sim.aurasOnActors[actor.guid] === undefined)
            sim.aurasOnActors[actor.guid] = 1;
        else
        {
            x += sim.aurasOnActors[actor.guid]*w;
            sim.aurasOnActors[actor.guid]++;
        }

        sim.ctx.drawImage(icon, x, y, w, h);
        if(dontShowCooldown !== true)
        {
            sim.ctx.save();
            sim.ctx.beginPath();
            sim.ctx.clip(sim.ctx.rect(x,y,w,h));
            sim.ctx.fillStyle = "rgba(0,0,0,0.6)";
            sim.ctx.beginPath();
            sim.ctx.moveTo(x+(h/2),y+(w/2));
            sim.ctx.arc(x+(h/2), y+(w/2), w, Math.PI*-0.5 ,Math.PI*(2*percentComplete-0.5));
            sim.ctx.closePath();
            sim.ctx.fill();
            sim.ctx.restore(); 
        }
        
        var stacks = aura.stacks;
        if(stacks === undefined  || stacks === null)
        {
            stacks = 1;
        }
        y += h*0.8;
        
        sim.ctx.font = Math.floor(w* 0.8)+"px Arial";  
        sim.ctx.fillStyle = textColor;
        turnShadowsOn(sim.ctx, 4 ,true);
        sim.ctx.fillText(stacks,x,y);
        turnShadowsOff(sim.ctx);
        
    };
};

var generateFakeAuraIconWithStacksOnLocation = function(icon, x, y, stackInfo, textColor, cooldownTime, scale)
{
    scale = scale||0.8;
    textColor = textColor||"rgb(255,255,255)";
    var calcPosition = null;
    if(Number.isInteger(x) && Number.isInteger(y))
        calcPosition = function(sim, iconW, iconH){
            var loc = sim.getCanvasCoords(x,y);
            return {x:loc.x-iconW*0.5, y:loc.y-iconH*0.5};
        };
    else
    {
        if(x === 'left' && y === 'bottom')
        {
            calcPosition = function(sim, iconW, iconH)
            {
                return {x:0, y:sim.canvas.height-iconH};
            };
        }  
    }
    if(calcPosition === null)
        console.log("genFakeAuraIconWStacksOnLoc: unsupported position");
    return function(sim)
    {      
        //var icon = spells[aura.spellIndex].getIcon();
        var w = options.simActorSize * scale;
        var h = options.simActorSize * scale;

        //var loc = sim.getCanvasCoords(x,y);
        //var offsetX = loc.x - w*0.5;
        //var offsetY = loc.y - h*0.5;
        var position = calcPosition(sim,w,h);
        sim.ctx.drawImage(icon, position.x, position.y, w, h);

        var stackState = stackInfo[stackInfo.binarySearch(replayTime)];
        if(cooldownTime)//cooldownTime)
        {
            var precentComplete;
            if(stackState.stacks === 0)
                percentComplete = 1;
            else
                percentComplete = (replayTime - stackState.time)/cooldownTime;


            sim.ctx.save();
            sim.ctx.beginPath();
            sim.ctx.clip(sim.ctx.rect(position.x,position.y,w,h));
            sim.ctx.fillStyle = "rgba(0,0,0,0.6)";
            sim.ctx.beginPath();
            sim.ctx.moveTo(position.x+(h/2),position.y+(w/2));
            sim.ctx.arc(position.x+(h/2), position.y+(w/2), w, Math.PI*-0.5 ,Math.PI*(2*percentComplete-0.5));
            sim.ctx.closePath();
            sim.ctx.fill();
            sim.ctx.restore(); 
        }
        
        var stacks = stackState.stacks;
        position.y += h*0.8;
        
        sim.ctx.font = Math.floor(w* 0.8)+"px Arial";  
        sim.ctx.fillStyle = textColor;
        turnShadowsOn(sim.ctx, 4 ,true);
        sim.ctx.fillText(stacks,position.x,position.y);
        var msgFont = Math.floor(w*0.2);
        sim.ctx.font = msgFont+"px Arial";
        if(stackState.msg)
        {
            position.y -= w*0.4;
            
            for(var mi = 0; mi < stackState.msg.length; mi++)
            {
                var thisX = position.x;
                var msg = stackState.msg[mi];
                position.y -= msgFont*2;
                for(var si = 0; si < msg.spells.length; si++)
                {
                    iconCache.drawIcon(msg.spells[si], msgFont, sim.ctx, thisX, position.y-msgFont );
                    thisX += msgFont;
                }
                var tDelta = ((replayTime - msg.time)/1000).toFixed(1);
                var str = tDelta+' '+msg.actor.name;
                sim.ctx.fillText(str, thisX, position.y);
            }
        }
        turnShadowsOff(sim.ctx);
        
    };
};

var generateStackCountOnActor = function(aura, actor, textColor, opt_minStacks)
{
    return function(sim)
    {
        if(!actor.state)
            return;
        
        var w = options.simActorSize * 0.8;
        var h = options.simActorSize * 0.8;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var x = loc.x - w*0.5;
        var y = loc.y - h*0.5;
        var stacks = aura.stacks;
        if(stacks === undefined  || stacks === null)
        {
            stacks = 1;
        }
        if(opt_minStacks !== undefined && stacks < opt_minStacks)
        {
            return;
        }

        if(sim.aurasOnActors[actor.guid] === undefined)
            sim.aurasOnActors[actor.guid] = 1;
        else
        {
            x += sim.aurasOnActors[actor.guid]*w;
            sim.aurasOnActors[actor.guid]++;
        }
        

        y += h*0.8;
        var fontSize = w*0.8;
        if(stacks < 10)
            fontSize*=1.3;
        else if(stacks > 100)
            fontSize*=.66;
        sim.ctx.font = Math.floor(w* 0.8)+"px Arial";  
        sim.ctx.fillStyle = textColor;
        turnShadowsOn(sim.ctx);
        sim.ctx.fillText(stacks,x,y);
        turnShadowsOff(sim.ctx);
    };
};

var generateIconOnActor = function(icon, actor, opt_startTime, opt_duration, opt_scale)
{
    opt_scale = opt_scale||0.8;
    return function(sim)
    {
        var w = options.simActorSize * opt_scale;
        var h = options.simActorSize * opt_scale;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var x = loc.x - w*0.5;
        var y = loc.y - h*0.5; 

        if(sim.aurasOnActors[actor.guid] === undefined)
            sim.aurasOnActors[actor.guid] = 1;
        else
        {
            x += sim.aurasOnActors[actor.guid]*w;
            sim.aurasOnActors[actor.guid]++;
        }

        sim.ctx.drawImage(icon, x, y, w, h);

        if(opt_startTime !== undefined && opt_duration !== undefined)
        {
            var centerX = x+(w/2);
            var centerY = y+(h/2);
            var percentComplete = (replayTime - opt_startTime)/opt_duration;
            sim.ctx.save();
            sim.ctx.beginPath();
            sim.ctx.clip(sim.ctx.rect(x,y,w,h));
            sim.ctx.fillStyle = "rgba(0,0,0,0.6)";
            sim.ctx.beginPath();
            sim.ctx.moveTo(centerX,centerY);
            sim.ctx.arc(centerX, centerY, w*0.71, Math.PI*-0.5 ,Math.PI*(2*percentComplete-0.5));
            sim.ctx.moveTo(centerX,centerY);
            sim.ctx.fill();
            sim.ctx.restore(); 
        }
    };
};

var generateRaidmarkOnActor = function(aura, actor)
{
    return function(sim)
    {
        if(!actor.state)
            return;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var w = options.simActorSize*0.8;
        var x = loc.x - w;
        var y = loc.y - w;
        sim.ctx.drawImage(spells[aura.spellIndex].getIcon(), x, y, w, w);
    };
};

var generateIconOnLocation = function(icon, x, y, opt_startTime, opt_duration, opt_scale)
{
    return function(sim)
    {
        if(!opt_scale)
            opt_scale = 1; 
        var w = options.simActorSize * 0.8 * opt_scale;
        var h = options.simActorSize * 0.8 * opt_scale;
        var loc = sim.getCanvasCoords(x,y);
        var offsetX = loc.x-(w/2);
        var offsetY = loc.y-(h/2);

        sim.ctx.drawImage(icon, offsetX, offsetY, w, h);

        if(opt_startTime !== undefined && opt_duration !== undefined)
        {
            var percentComplete = (replayTime - opt_startTime)/opt_duration;
            sim.ctx.save();
            sim.ctx.beginPath();
            sim.ctx.clip(sim.ctx.rect(offsetX,offsetY,w,h));
            sim.ctx.fillStyle = "rgba(0,0,0,0.6)";
            sim.ctx.beginPath();
            sim.ctx.moveTo(loc.x,loc.y);
            sim.ctx.arc(loc.x, loc.y, w*0.71, Math.PI*-0.5 ,Math.PI*(2*percentComplete-0.5));
            sim.ctx.moveTo(0,0);
            sim.ctx.fill();
            sim.ctx.restore(); 
        }
    };
};

var generateLineBetweenPoints = function(x1, y1, x2, y2, color, width, opt_pxNotYds)
{
    return function(sim)
    {
        var loc1 = sim.getCanvasCoords(x1, y1);
        var loc2 = sim.getCanvasCoords(x2, y2);
        sim.ctx.lineWidth = width*((opt_pxNotYds === true)?1:sim.scale);
        sim.ctx.strokeStyle = color;
        sim.ctx.beginPath();
        sim.ctx.moveTo(loc1.x,loc1.y);
        sim.ctx.lineTo(loc2.x,loc2.y);
        sim.ctx.closePath();
        sim.ctx.stroke();
    };
};

var generateLineBetweenActors = function(actor1, actor2, color, width, opt_MaxRange, opt_MaxColor, opt_pxNotYds)
{
    return function(sim)
    {
        if(!actor1.state || !actor2.state)
        {
            return;
        }
        
        var loc1 = sim.getCanvasCoords(actor1.state.x, actor1.state.y);
        var loc2 = sim.getCanvasCoords(actor2.state.x, actor2.state.y);
        sim.ctx.lineWidth = width*((opt_pxNotYds === true)?1:sim.scale);
        sim.ctx.strokeStyle = color;
        if(Number.isFinite(opt_MaxRange))
        {
            var dx = actor1.state.x - actor2.state.x;
            var dy = actor1.state.y - actor2.state.y;
            var dist = Math.sqrt(dx*dx+dy*dy);
            if(dist > opt_MaxRange)
                sim.ctx.strokeStyle = opt_MaxColor;
        }
        sim.ctx.beginPath();
        sim.ctx.moveTo(loc1.x, loc1.y);
        sim.ctx.lineTo(loc2.x, loc2.y);
        sim.ctx.closePath();
        sim.ctx.stroke();
    };
};

var generateLineBetweenActorAndPoint = function(actor, x, y, color, width)
{
    return function(sim)
    {
        if(!actor.state)
            return;
        
        var loc1 = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var loc2 = sim.getCanvasCoords(x, y);
        sim.ctx.lineWidth = width*sim.scale;
        sim.ctx.strokeStyle = color;
        sim.ctx.beginPath();
        sim.ctx.moveTo(loc1.x, loc1.y);
        sim.ctx.lineTo(loc2.x, loc2.y);
        sim.ctx.closePath();
        sim.ctx.stroke();
    };
};

var generateVectorBetweenActors = function(vSrc, vDir, width, opt_color)
{
    return function(sim)
    {
        if(!vSrc.state || !vDir.state)
            return;
        
        var loc1 = sim.getCanvasCoords(vSrc.state.x, vSrc.state.y);
        var loc2 = sim.getCanvasCoords(vDir.state.x, vDir.state.y);
        var dx = loc2.x - loc1.x;
        var dy = loc2.y - loc1.y;
        
        //TODO: this is only for m archi, clean this up
        if(opt_color === undefined)
        {
            sim.ctx.lineWidth = 3;
            sim.ctx.strokeStyle = vSrc.class.color;
            sim.ctx.beginPath();
            sim.ctx.moveTo(loc1.x-1, loc1.y-1);
            sim.ctx.lineTo(loc1.x+(dx*1000)-1, loc1.y+(dy*1000)-1);
            sim.ctx.closePath();
            sim.ctx.stroke();
            
            sim.ctx.strokeStyle = vDir.class.color;
            sim.ctx.beginPath();
            sim.ctx.moveTo(loc1.x+1, loc1.y+1);
            sim.ctx.lineTo(loc1.x+(dx*1000)+1, loc1.y+(dy*1000)+1);
            sim.ctx.closePath();
            sim.ctx.stroke();
        }
        else
        {
            sim.ctx.lineWidth = width*sim.scale;
            sim.ctx.strokeStyle = opt_color;
            sim.ctx.beginPath();
            sim.ctx.moveTo(loc1.x, loc1.y);
            sim.ctx.lineTo(loc1.x+(dx*1000), loc1.y+(dy*1000));
            sim.ctx.stroke();
        }
    };
};

var generateConeOnActor = function(actor, directionAngle, width, radius, color)
{
    return function(sim)
    {
        if(!actor.state)
            return;   
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        
        //console.log("dx: "+dx+" dy: "+dy+" dir: "+directionAngle);
        var startAngle = directionAngle - (width/2);
        var endAngle = directionAngle + (width/2);
        sim.ctx.fillStyle = color;
        sim.ctx.beginPath();
        sim.ctx.moveTo(loc.x, loc.y);
        sim.ctx.arc(loc.x, loc.y, radius*sim.scale, startAngle, endAngle);
        sim.ctx.closePath();
        sim.ctx.fill();
    };
};

var generateConeBetweenActors = function(coneSource, coneTarget, width, radius, color)
{
    return function(sim)
    {
        if(!coneSource.state || !coneTarget.state)
            return;   
        var srcLoc = sim.getCanvasCoords(coneSource.state.x, coneSource.state.y);
        var directionAngle = getAngleBetweenPoints(coneSource.state.x, coneSource.state.y, coneTarget.state.x, coneTarget.state.y);
        
        //console.log("dx: "+dx+" dy: "+dy+" dir: "+directionAngle);
        var startAngle = directionAngle - (width/2);
        var endAngle = directionAngle + (width/2);
        sim.ctx.fillStyle = color;
        sim.ctx.beginPath();
        sim.ctx.moveTo(srcLoc.x, srcLoc.y);
        sim.ctx.arc(srcLoc.x, srcLoc.y, radius*sim.scale, startAngle, endAngle);
        sim.ctx.closePath();
        sim.ctx.fill();
    };
};

var generateLabelOnActor = function(actor, labelText, textColor)
{
    return function(sim)
    {
        if(!actor.state)
            return;   
        var w = options.simActorSize * 0.8;
        var h = options.simActorSize * 0.8;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var x = loc.x - w*0.5;
        var y = loc.y + h*0.5;
        sim.ctx.font = Math.floor(w* 0.7)+"px Arial";  
        sim.ctx.fillStyle = textColor;
        turnShadowsOn(sim.ctx);
        sim.ctx.fillText(labelText,x,y);
        turnShadowsOff(sim.ctx);
    }
}

var generateResCountOnActor = function(actor, resType, OPT_txtColor)
{
    return function(sim)
    {
        OPT_txtColor = OPT_txtColor||"rgb(255,255,255)";
        if(!actor.state || actor.state instanceof Death)
            return;
        if(actor.state.res[resType] === undefined)
            return;
        var w = options.simActorSize * 0.8;
        var h = options.simActorSize * 0.8;
        var loc = sim.getCanvasCoords(actor.state.x, actor.state.y);
        var x = loc.x - w*0.5;
        var y = loc.y + h*0.5;

        if(sim.aurasOnActors[actor.guid] === undefined)
            sim.aurasOnActors[actor.guid] = 1;
        else
        {
            x += sim.aurasOnActors[actor.guid]*w;
            sim.aurasOnActors[actor.guid]++;
        }
        if(actor.state.res[resType].cur < 100)
            sim.ctx.font = Math.floor(w)+"px Arial"; 
        else
            sim.ctx.font = Math.floor(w*(2/3))+"px Arial";
        sim.ctx.fillStyle = OPT_txtColor;
        turnShadowsOn(sim.ctx);
        sim.ctx.fillText(actor.state.res[resType].cur,x,y);
        turnShadowsOff(sim.ctx);
    }
}

var getProjectilePath = function(srcActor, targActor, speed, startTime)
{
    var path = [];
    var returnTime, endTime;
    var srcStart = srcActor.getStateAtTime(startTime);
    var projLoc = {x:srcStart.x, y:srcStart.y};
    var timeStep = 100;
    var distStep = speed/1000*timeStep;
    for(var t = startTime; t < encounterInfo.fightLength; t+=timeStep)
    {
        var targLoc = targActor.getStateAtTime(t);
        var dx = targLoc.x - projLoc.x;
        var dy = targLoc.y - projLoc.y;
        var dist = Math.sqrt(dx*dx+dy*dy);
        if(dist > 10000)
            break;
        if(dist < distStep)
        {
            t += Math.floor(timeStep*(dist/distStep));
            path.push({time:t, x:targLoc.x, y:targLoc.y});
            break;
        }
        else
        {
            projLoc.x += (dx/dist*distStep);
            projLoc.y += (dy/dist*distStep);
            path.push({time:t, x:projLoc.x, y:projLoc.y});
        }
    }

    if(path.length === 0)
        path.push({time:startTime, x:Number.MAX_VALUE, y:Number.MAX_VALUE});
    return path;
};

var generateProjectileBetweenActors = function(srcActor, targActor, path, color, width, pxNotYds, icon, opt_reverseDir)
{
    return function(sim)
    {
        var srcState = srcActor.getStateAtTime(replayTime);
        var targState = targActor.getStateAtTime(replayTime);
        if(!srcState || !targState)
        {
            return;
        }
        
        var srcLoc = sim.getCanvasCoords(srcState.x, srcState.y);
        var targLoc = sim.getCanvasCoords(targState.x, targState.y);
        if(opt_reverseDir === true)
        {
            var tmp = srcLoc;
            srcLoc = targLoc;
            targLoc = tmp;
        }
        sim.ctx.lineWidth = width*((pxNotYds === true)?1:sim.scale);
        sim.ctx.strokeStyle = color;

        var index = path.binarySearch(replayTime);
        if(index+1 < path.length)
        {
            var percentBetween = (replayTime-path[index].time)/(path[index+1].time-path[index].time);
            var pathLoc = sim.getCanvasCoords(path[index].x*(1-percentBetween) + path[index+1].x*percentBetween,
                                            path[index].y*(1-percentBetween) + path[index+1].y*percentBetween);
        }
        else
        {
            var pathLoc = sim.getCanvasCoords(path[index].x, path[index].y);
        }
        var sac = options.simActorSize;
        sim.ctx.beginPath();
        sim.ctx.moveTo(pathLoc.x, pathLoc.y);
        sim.ctx.lineTo(targLoc.x, targLoc.y);
        sim.ctx.closePath();
        sim.ctx.stroke();
        sim.ctx.drawImage(icon, pathLoc.x-(sac/2), pathLoc.y-(sac/2), sac, sac);
    };
};


var generateChaseOrb = function(actor, path, radius, color, startTime, endTime)
{   
    return function(sim)
    {
        var dt = 250;
        var timeActive = replayTime - startTime;
        var index = parseInt(timeActive/dt);
        var progress = timeActive % dt;


        if(index >= path.length-1)
            var loc = sim.getCanvasCoords(path[path.length-1].x, path[path.length-1].y);
        else
        {
            var x = path[index].x*((dt-progress)/dt) + path[index+1].x*(progress/dt);
            var y = path[index].y*((dt-progress)/dt) + path[index+1].y*(progress/dt);
            var loc = sim.getCanvasCoords(x,y);
        }

        sim.ctx.fillStyle = color;
        sim.ctx.beginPath();
        sim.ctx.arc(loc.x, loc.y, radius*sim.scale, 0, 2*Math.PI);
        sim.ctx.closePath();
        sim.ctx.fill();

        if(actor.state)
        {
            var actorLoc = sim.getCanvasCoords(actor.state.x, actor.state.y);
            sim.ctx.lineWidth = 2;
            sim.ctx.strokeStyle = color;
            sim.ctx.beginPath();
            sim.ctx.moveTo(loc.x, loc.y);
            sim.ctx.lineTo(actorLoc.x, actorLoc.y);
            sim.ctx.closePath();
            sim.ctx.stroke();
        }
    };
}

var getChasePath = function(actor, speed, startTime, endTime)
{
    var path = [];
    var dt = 250;
    speed *= (dt/1000);
    var loc = actor.getStateAtTime(startTime-600);//delay for orb spawn
    path.push({time:startTime, x:loc.x, y:loc.y});

    for(var t = startTime+dt; t <= endTime; t+=dt)
    {
        loc = actor.getStateAtTime(t);
        var dx = loc.x - path[path.length-1].x;
        var dy = loc.y - path[path.length-1].y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if(dist <= speed)
        {
            path.push({time:t, x:loc.x, y:loc.y})
        }
        else
        {
            var distScale = speed/dist;
            path.push({time:t, x:path[path.length-1].x+(dx*distScale), y:path[path.length-1].y+(dy*distScale)})
        }
    }
    return path;
};
//inputs should be in-game yds, will be converted to canvas coords
var getAngleBetweenPoints = function(startX, startY, endX, endY)
{
    var s = draw.sim.getCanvasCoords(startX, startY);
    var e = draw.sim.getCanvasCoords(endX, endY);
    var dx = e.x - s.x;
    var dy = e.y - s.y;
    var dir = Math.atan(dy/dx);
    if(dx < 0)
        dir += Math.PI;
    return dir;
};

//one of the two layers
var visualEffects = function(parentSim)
{
    this.EA = [];//events array, intentionally uninit until data is provided.
    this.AM = new Map();//actives map?
    this.i = 0;
    this.nextTime = Number.MAX_VALUE;//will be set properly once data is recieved.
    this.nameCounter = 0;
    this.parentSim = parentSim;
    
    this.addStates = function(name, timeStart, duration, drawFunc, opt_actor)
    {
        //handle initilzation of the first state time
        if(this.nextTime > timeStart)
        {
            this.nextTime = timeStart;
        }
        name = name+this.nameCounter;
        this.insertIntoEA(new this.turnVisualOn(name, timeStart, duration, drawFunc, opt_actor));
        this.insertIntoEA(new this.turnVisualOff(name, timeStart + duration));
        this.nameCounter++;
    };
    
    this.step = function(time)
    {
        while(time > this.nextTime)
        {
            this.EA[this.i].update(this.AM);
            this.i++;
            if(this.i >= this.EA.length)
                this.nextTime = Number.MAX_VALUE;
            else
                this.nextTime = this.EA[this.i].time; 
        }
    };
    
    this.skip = function(time)
    {
        this.AM = new Map();
        this.i = 0;
        if(this.EA.length > 0)
            this.nextTime = this.EA[0].time;
        else
            this.nextTime = Number.MAX_VALUE;
        this.step(time);
    };
    
    this.draw = function(opt_actor)
    {
        var closuresAreFun = this;
        this.AM.forEach(function(f){
            if(opt_actor !== null)
            {
                if(opt_actor === f.opt_actor)
                    f.drawFunc(closuresAreFun.parentSim);
                return;
            }

            f.drawFunc(closuresAreFun.parentSim);
        });
    };
    
    this.insertIntoEA = function(newState)
    {
        for(var i = 0; i < this.EA.length; i++)
        {
            if(this.EA[i].time > newState.time)
            {
                var swap = this.EA[i];
                this.EA[i] = newState;
                newState = swap;
            }
        }
        this.EA.push(newState);
    };
    
    this.turnVisualOn = function(name, time, duration, drawFunc, opt_actor)
    {
        this.name = name;
        this.time = time;
        this.duration = duration;
        this.drawFunc = drawFunc;
        this.opt_actor = null||opt_actor;
        
        this.update = function(map)
        {
            //console.log(this.name + " on");
            map.set(this.name, this);
        };
    };
    
    this.turnVisualOff = function(name, endTime)
    {
        this.name = name;
        this.time = endTime;
        this.update = function(map)
        {
            //console.log(this.name+" off");
            map.delete(this.name);
        };
    };
};


/*var DEBUG_CIRCLE = {};
DEBUG_CIRCLE.radius = 25;
DEBUG_CIRCLE.color = "rgba(255,0,0,0.4)";
DEBUG_CIRCLE.x = -3440.96;
DEBUG_CIRCLE.y = -87.39;

var DEBUG_generateCircleOnLocation = function()
{
    return function(sim)
    {
        var loc = sim.getCanvasCoords(DEBUG_CIRCLE.x,DEBUG_CIRCLE.y);
        sim.ctx.fillStyle = DEBUG_CIRCLE.color;
        sim.ctx.beginPath();
        sim.ctx.arc(loc.x, loc.y, DEBUG_CIRCLE.radius*sim.scale, 0, 2*Math.PI);
        sim.ctx.closePath();
        sim.ctx.fill();

    };
};*/
