var simPadding = 1.1;//extra padding to keep away from edges
var highlightedActor = null;


var TooltipControl = function()
{
    this.tooltip = document.getElementById('tooltip');
    this.mouseEvent = null;
    this.emptyFunction = function(){};
    this.update = this.emptyFunction;
    this.reset = function()
    {
        this.tooltip.style.visibility = "hidden";
        this.update = draw.tooltip.emptyFunction;
    };
    this.reposition = function()
    {
        var newX = this.mouseEvent.pageX + 10;
        var newY = this.mouseEvent.pageY - 15;
        if(newX < 0)
            newX = 0;
        if(newY < 0)
            newY = 0;

        var offRight = newX + this.tooltip.clientWidth - window.innerWidth;
        if(offRight > 0)
            newX -= offRight+3;
        var offBot = newY + this.tooltip.clientHeight - window.innerHeight;
        if(offBot > 0)
            newY -= offBot+3;
        

        this.tooltip.style.left = newX+"px";
        this.tooltip.style.top = newY+"px";
    };
    this.updateMousePosition = function(mouseEvent)//canvasX, canvasY, pageX, pageY)
    {
        this.mouseEvent = mouseEvent;
    };

    this.generateSimTooltip = function(sim)
    {
        var thisTt = this;
        this.update = function(){
            if(thisTt.mouseEvent === null)
                return thisTt.tooltip.style.visibility = "hidden";
            var newTarget = sim.closestActor(thisTt.mouseEvent.layerX, thisTt.mouseEvent.layerY);//was offset
            if(newTarget)
            {
                thisTt.tooltip.style.visibility = "visible";
                thisTt.tooltip.style.color = newTarget.class.color;
                thisTt.tooltip.style["border-color"] = newTarget.class.color;
                thisTt.tooltip.innerHTML = newTarget.name;
                if(newTarget.states.SA[newTarget.states.i])
                {
                    thisTt.tooltip.innerHTML += "<br>"+newTarget.states.SA[newTarget.states.i].toString();
                    thisTt.tooltip.innerHTML += "X:"+newTarget.state.x.toFixed(3)+" Y:"+newTarget.state.y.toFixed(3);
                }
                thisTt.reposition(); 
            }
            else
            {
                thisTt.tooltip.style.visibility = "hidden";
            }
        };
    };
    this.generateRaidframeTooltip = function(raidFrameControl)
    {
        var thisTt = this;
        this.update = function()
        {
            var aura = raidFrameControl.getAuraUnderMouse(thisTt.mouseEvent.offsetX, thisTt.mouseEvent.offsetY);
            if(aura === null)
                return thisTt.tooltip.style.visibility = "hidden";
            thisTt.tooltip.style.visibility = "visible";
            var source = actors[aura.source];
            var percentComplete = (Math.floor(((replayTime-aura.timeApplied)/(aura.timeRemoved-aura.timeApplied))*100));
            var stacks = (aura.stacks!==null)?("Stacks: "+aura.stacks+"<br>"):"";
            var mag = (aura.magnitude!==null)?("Magnitude: "+aura.magnitude+"<br>"):"";
            thisTt.tooltip.style.color = source.class.color;
            thisTt.tooltip.style["border-color"] = source.class.color;
            thisTt.tooltip.innerHTML = spells[aura.spellIndex].name+"<br>"+
                source.name + "<br>"+
                stacks+mag+
                timeToString(aura.timeApplied)+" - "+timeToString(aura.timeRemoved)+"("+percentComplete+"%)";
            thisTt.reposition();
            
        }
    };
}

//class, to control the canvas that the sim is drawn onto
var SimControl = function(containingDivId, canvasId)
{
    this.containingDiv = document.getElementById(containingDivId);
    this.canvas = document.getElementById(canvasId); //handle to the canvas object

    this.canvas.onmouseenter = function(){draw.tooltip.generateSimTooltip(draw.sim);}
    this.canvas.onmouseleave = function(){draw.tooltip.reset();};
    this.canvas.onclick = function(e)
    {
        highlightActor(draw.sim.closestActor(e.offsetX, e.offsetY));
        if(e.ctrlKey)
        {
            var xyYds = draw.sim.convertPxToYds(e.offsetX, e.offsetY);
            console.log("Click in yds: ("+xyYds.x+","+xyYds.y+")")
        }
    };

    this.ctx = this.canvas.getContext('2d'); //used to draw to the canvas


    this.fightOffsetX; //centers the actors in the middle of the canvas
    this.fightOffsetY; //^ 
    this.scale; //increases or decreases the movement to fit everything on the canvas

    this.xMin = Number.MAX_VALUE; //record the range of locations we need to draw
    this.xMax = Number.MAX_VALUE*-1;
    this.yMin = Number.MAX_VALUE;
    this.yMax = Number.MAX_VALUE*-1;
    

    this.BackgroundControl = function(primaryCanvasCtx)
    {
        this.primaryCanvasCtx = primaryCanvasCtx;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.backgroundColor = "rgb(255,255,255)";
        this.mapImage;
        this.mapCoordToPx;
        this.mapWidthOffset;
        this.mapHeightOffset;
        this.fightOffsetX;
        this.fightOffsetY;
        this.scale;
        this.selectBackgroundImage = function(){return false;};
        this.onImageLoad = function()
        {
            draw.sim.background.drawCache();
            draw.sim.draw(replayTime);
        };

        this.setSize = function(canvasWidth, canvasHeight, fightOffsetX, fightOffsetY, scale)//set the camera requirements and refresh cache and background
        {
            if(canvasWidth)
                this.canvas.width = canvasWidth;
            if(canvasHeight)
                this.canvas.height = canvasHeight;
            this.fightOffsetX = fightOffsetX;
            this.fightOffsetY = fightOffsetY;
            this.scale = scale;
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
            this.drawCache();
        };

        this.setMap = function(mapFile, mapScale, wOffset, hOffset, backgroundColor)
        {
            this.mapImage = new Image();
            this.mapImage.src = mapFile;
            this.mapCoordToPx = mapScale;
            this.mapWidthOffset = wOffset;
            this.mapHeightOffset = hOffset;
            if(backgroundColor)
                this.backgroundColor = backgroundColor;
            else
                this.backgroundColor = "rgb(165,138,90)";

            this.mapImage.onload = this.onImageLoad;
        };

        //note, does bypass the call to draw.setBackground()
        this.setDoubleMap = function(mapFile1, mapScale1, wOffset1, hOffset1, bgc1,
                                        mapFile2, mapScale2, wOffset2, hOffset2, bgc2)
        {
            bgc1 = bgc1?bgc1:"rgb(165,138,90)";
            bgc2 = bgc2?bgc2:"rgb(165,138,90)";

            this.firstMap = {};
            this.mapImage = this.firstMap.file = new Image();
            this.firstMap.file.src = mapFile1;
            this.mapImage.onload = this.onImageLoad;
            this.mapCoordToPx = this.firstMap.mapCoordToPx = mapScale1;
            this.mapWidthOffset = this.firstMap.mapWidthOffset = wOffset1;
            this.mapHeightOffset = this.firstMap.mapHeightOffset = hOffset1;
            this.backgroundColor = this.firstMap.backgroundColor = bgc1;

            this.secondMap = {};
            this.secondMap.file = new Image();
            this.secondMap.file.src = mapFile2;
            this.secondMap.mapCoordToPx = mapScale2;
            this.secondMap.mapWidthOffset = wOffset2;
            this.secondMap.mapHeightOffset = hOffset2;
            this.secondMap.backgroundColor = bgc2;
            this.swapTime = Number.MAX_VALUE;
            this.currentImage = 1;
            this.selectBackgroundImage = function(time)
            {
                if(time > this.swapTime && this.currentImage === 1)
                {
                    this.currentImage = 2;
                    this.mapImage = this.secondMap.file;
                    this.mapCoordToPx = this.secondMap.mapCoordToPx;
                    this.mapWidthOffset = this.secondMap.mapWidthOffset;
                    this.mapHeightOffset = this.secondMap.mapHeightOffset;
                    this.backgroundColor = this.secondMap.backgroundColor;
                    this.drawCache();
                }
                else if(time <= this.swapTime && this.currentImage === 2)
                {
                    this.currentImage = 1;
                    this.mapImage = this.firstMap.file;
                    this.mapCoordToPx = this.firstMap.mapCoordToPx;
                    this.mapWidthOffset = this.firstMap.mapWidthOffset;
                    this.mapHeightOffset = this.firstMap.mapHeightOffset;
                    this.backgroundColor = this.firstMap.backgroundColor;
                    this.drawCache();
                }
            };
        }

        this.drawCache = function()
        {
            this.ctx.fillStyle = this.backgroundColor;
            this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
            if(this.mapImage && this.mapImage.complete)
            {
                var topleftMapCoordW = ((-this.canvas.width)/(this.scale*2)) - this.fightOffsetX;
                var topleftMapCoordH = ((-this.canvas.height)/(this.scale*2)) - this.fightOffsetY;
            
                var botrightMapCoordW = (this.canvas.width/this.scale) - (this.canvas.width/(this.scale*2)) - this.fightOffsetX; 
                var botrightMapCoordH = (this.canvas.height/this.scale) - (this.canvas.height/(this.scale*2)) - this.fightOffsetY; 
                var x = (topleftMapCoordW - this.mapWidthOffset) / this.mapCoordToPx; 
                var y = (topleftMapCoordH - this.mapHeightOffset) / this.mapCoordToPx;
                var w = (botrightMapCoordW - topleftMapCoordW)/this.mapCoordToPx;
                var h = (botrightMapCoordH - topleftMapCoordH)/this.mapCoordToPx;
                this.ctx.drawImage(this.mapImage,x,y,w,h,0,0,this.canvas.width, this.canvas.height);
            }
        }

        this.draw = function(time)
        {
            this.selectBackgroundImage(time)
            this.primaryCanvasCtx.drawImage(this.canvas, 0 ,0);
        };
    };
    this.background = new this.BackgroundControl(this.ctx);
    
    this.lowerVisuals = new visualEffects(this);
    this.actorVisuals = new visualEffects(this);
    this.upperVisuals = new visualEffects(this);
    this.aurasOnActors = {};//used by the visual effects to keep track of how many aura icons are on a given actor

    this.classCache = document.createElement("canvas");
    this.classCacheCtx = this.classCache.getContext('2d');
    this.classCacheReady = false;
    
    //function, setup the canvas and scale data to fill 
    this.init = function()
    {
        this.canvas.width /*= this.background.canvas.width */= this.containingDiv.offsetWidth;//match the num of pixels to size of canvas
        this.canvas.height /*= this.background.canvas.height */= this.containingDiv.offsetHeight
        this.fightOffsetX = this.fightOffsetY = this.scale = null;
        if(options.cameraStyle === 0)
        {
            var deltaX = Math.abs(this.xMax - this.xMin);//calc range of xy values
            var deltaY = Math.abs(this.yMax - this.yMin);
            this.fightOffsetX = (this.xMin + Math.floor(deltaX/2)) * -1;//offset to center data on canvas
            this.fightOffsetY = (this.yMin + Math.floor(deltaY/2)) * -1;
            
            //take smallest padding val that will fill screen without going off
            var scaleX = this.canvas.width/(deltaX*simPadding);
            var scaleY = this.canvas.height/(deltaY*simPadding);
            this.scale = (scaleX < scaleY)?scaleX:scaleY;

            this.background.setSize(this.canvas.width, this.canvas.height, this.fightOffsetX, this.fightOffsetY, this.scale);
        }
        else if(options.cameraStyle === 1)
        {
            this.updateDynamicCamera();
        }
    };

    this.initClassCache = function()
    {
        if(!encounterInfo)
            return;
        this.classCacheReady = true;
        this.classCache = document.createElement("canvas");
        this.classCacheCtx = this.classCache.getContext('2d');
        this.classCache.height = options.simActorSize;
        this.classCache.width = (playerClassList.length + encounterInfo.mobs.length)*options.simActorSize;
        var ci = 0;
        for(var pi = 0; pi < playerClassList.length; pi++)
        {
            this.classCacheCtx.drawImage(playerClassList[pi].icon, options.simActorSize*ci, 0, options.simActorSize, options.simActorSize);
            ci++
        }

        for(var mi = 0; mi < encounterInfo.mobs.length; mi++)
        {
            var mob = encounterInfo.mobs[mi];
            if(mob.icon.complete === false || mob.icon.width === 0)
            {
                this.classCacheReady = false;
            }
            this.classCacheCtx.drawImage(mob.icon, options.simActorSize*ci, 0, options.simActorSize, options.simActorSize);
            ci++;
        }
    };
    
    this.setMap = function(mapFile, mapScale, wOffset, hOffset, backgroundColor)
    {
        this.background.setMap(mapFile, mapScale, wOffset, hOffset, backgroundColor);
    };

    this.updateDynamicCamera = function()
    {
        var dynMinX = dynMinY = Number.MAX_VALUE;
        var dynMaxX = dynMaxY = -Number.MAX_VALUE;
        for(var ai = 0; ai < actors.length; ai++)
        {
            var actor = actors[ai];
            if(actor.state !== null && !(actor.state instanceof Death))
            {
                if(actor.state.x > dynMaxX)
                    dynMaxX = actor.state.x;
                if(actor.state.x < dynMinX)
                    dynMinX = actor.state.x;
                if(actor.state.y > dynMaxY)
                    dynMaxY = actor.state.y;
                if(actor.state.y < dynMinY)
                    dynMinY = actor.state.y;
            }
        }
        if(dynMinX === Number.MAX_VALUE || dynMaxX === -Number.MAX_VALUE || dynMinY === Number.MAX_VALUE || dynMaxY === -Number.MAX_VALUE)
        {
            dynMinX = this.xMin;
            dynMaxX = this.xMax;
            dynMinY = this.yMin;
            dynMaxY = this.yMax;
        }
        var dynDx = Math.abs(dynMaxX - dynMinX);
        var dynDy = Math.abs(dynMaxY - dynMinY);
        var newOffX = (dynMinX + Math.floor(dynDx/2)) * -1;
        var newOffY = (dynMinY + Math.floor(dynDy/2)) * -1;
        var dynScaleX = this.canvas.width/(dynDx*simPadding);
        var dynScaleY = this.canvas.height/(dynDy*simPadding);
        var newScale = (dynScaleX < dynScaleY)?dynScaleX:dynScaleY;

        var maxChange = 0.1;
        if(this.scale === null)
        {
            this.fightOffsetX = newOffX;
            this.fightOffsetY = newOffY;
            this.scale = newScale;
        }
        else
        {
            this.fightOffsetX += (newOffX - this.fightOffsetX)*maxChange;
            this.fightOffsetY += (newOffY - this.fightOffsetY)*maxChange;
            this.scale += (newScale - this.scale)*maxChange;
        }
        this.background.setSize(null, null, this.fightOffsetX, this.fightOffsetY, this.scale);
    }
    
    //function, called when states added to actors, record range of XY vals
    this.updateBounds = function(x,y)
    {
        if(x < this.xMin)
            this.xMin = x; 
        if(x > this.xMax)
            this.xMax = x;
        if(y < this.yMin)
            this.yMin = y;
        if(y > this.yMax)
            this.yMax = y;
    };
    
    this.draw = function(time)
    {
        if(this.classCacheReady === false)
            this.initClassCache();



        this.ctx.mozImageSmoothingQuality = "high";
        this.ctx.msImageSmoothingQuality = "high";
        this.ctx.imageSmoothingQuality = "high";
        if(options.cameraStyle === 1)
        {
            this.updateDynamicCamera();
        }
        this.background.draw(time);

        this.aurasOnActors = {};
        this.lowerVisuals.step(time);
        this.actorVisuals.step(time);
        this.upperVisuals.step(time);
        if(options.healerRange)
            this.drawHealerRange();
        this.lowerVisuals.draw();

        var closuresAreFun = this;
        actors.forEach(function(a)
        {
            if(a.state !== null && !(a.state instanceof Death) && a !== highlightedActor)
                closuresAreFun.drawActor(a);
                
        });

        if(highlightedActor !== null && highlightedActor.state !== null && !(highlightedActor.state instanceof Death))
        {
            this.drawHighlight(highlightedActor);
        }
        if(options.healerRange || options.dpsTargets)
            this.drawTargets();
        this.upperVisuals.draw();
    };

    this.DEBUGDRAW = function()
    {

        if(this.DEBUGPOS === undefined)
        {
            this.DEBUGPOS = {};
            for(var ai = 0; ai < actors.length; ai++)
            {
                var sa = actors[ai].states.SA;
                for(var si = 0; si < sa.length; si++)
                {
                    var X = sa[si].x.toFixed(1);
                    var Y = sa[si].y.toFixed(1);
                    if(sa[si] instanceof Death || X === 0)
                        continue;
                    if(this.DEBUGPOS[X] === undefined)
                        this.DEBUGPOS[X] = {};
                    if(this.DEBUGPOS[X][Y] === undefined)
                        this.DEBUGPOS[X][Y] = {};
                }
            }

            //this.ctx.fillStyle = "rgba(255,255,255)";
            //this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
            this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "rgb(255,0,0)";
            var xList = Object.getOwnPropertyNames(this.DEBUGPOS);
            for(var xi = 0; xi < xList.length; xi++)
            {
                var yList = Object.getOwnPropertyNames(this.DEBUGPOS[xList[xi]]);
                for(var yi = 0; yi < yList.length; yi++)
                {
                    var loc = this.getCanvasCoords(parseFloat(xList[xi]), parseFloat(yList[yi]));
                    this.ctx.beginPath();
                    this.ctx.arc(loc.x, loc.y, 1, 0, 2*Math.PI);
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            }
            this.DEBUGIMG = new Image();
            this.DEBUGIMG.src = this.canvas.toDataURL();
        }


        this.background.drawCache();
        this.background.draw();
        this.ctx.drawImage(this.DEBUGIMG, 0,0);
    };

    this.drawHealerRange = function(drawActorOnPrimary)
    {
        for(var ai = 0; ai < actors.length; ai++)
        {
            var a = actors[ai];
            if(!(a.class instanceof PlayerClass) || a.class.isHealer === false || a.state === null || a.state instanceof Death)
                continue;
            if(this.isPrimary === undefined || this.isPrimary === drawActorOnPrimary(a))
            {
                var loc = this.getCanvasCoords(a.state.x, a.state.y);
                var c = a.class.color;
                var r = parseInt(c.substr(1,2),16);
                var g = parseInt(c.substr(3,2),16);
                var b = parseInt(c.substr(5,2),16);
                this.ctx.fillStyle = "rgba("+r+","+g+","+b+",0.25)";
                this.ctx.beginPath();
                this.ctx.arc(loc.x, loc.y, 40*this.scale, 0, 2*Math.PI);
                this.ctx.closePath();
                this.ctx.fill();

            }
        }
    };
    this.drawTargets = function()
    {
        for(var ai = 0; ai < actors.length; ai++)
        {
            var a = actors[ai];
            var t = a.target;
            //exit early if the actor is dead/inactive
            if(a.state === null || a.state instanceof Death)
                continue;
            //see if the actor is a type we care about tracking
            if((a.class.isDPS && options.dpsTargets) ||
                (a.class.isHealer && options.healerRange))
            {
                //make sure the target is alive and active
                if(t !== null && t.state !== null && !(t.state instanceof Death))
                {
                    var actLoc = this.getCanvasCoords(a.state.x, a.state.y);
                    var targLoc = this.getCanvasCoords(t.state.x, t.state.y);
                    
                    this.ctx.strokeStyle = a.class.color;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(actLoc.x, actLoc.y);
                    this.ctx.lineTo(targLoc.x, targLoc.y);
                    this.ctx.closePath();
                    this.ctx.stroke();
                }
            }
        }
    };
    
    this.skip = function(time)
    {
        this.lowerVisuals.skip(time);
        this.actorVisuals.skip(time);
        this.upperVisuals.skip(time);
        if(options.cameraStyle === 1)
            this.scale = null;
    };
    
    //function, draw an actor on the canvas
    //actor(actor), the actor to be drawn
    this.drawActor = function(actor)
    {
        var loc = this.getCanvasCoords(actor.state.x, actor.state.y);
        var adjustedX = loc.x - options.simActorSize / 2;
        var adjustedY = loc.y - options.simActorSize / 2;
        if(actor.class && actor.class.icon)
	    {
            turnShadowsOn(this.ctx);
            this.ctx.drawImage(this.classCache,
                options.simActorSize*actor.class.listIndex,0,options.simActorSize, options.simActorSize,
                adjustedX, adjustedY, options.simActorSize, options.simActorSize);
            turnShadowsOff(this.ctx);
            if(actor.class instanceof EncounterMob)
            {
                var hpPercent = actor.state.curHP/actor.state.maxHP;
                var width = options.simActorSize*hpPercent;
                adjustedY -= 1;
                this.ctx.strokeStyle = "rgb(0,255,0)";
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(adjustedX, adjustedY);
                this.ctx.lineTo(adjustedX+width, adjustedY);
                this.ctx.closePath();
                this.ctx.stroke();
                
            }
            this.actorVisuals.draw(actor);
        }
        else
        {
            console.log("drawActor: missing class/icon");
        }
    };
    
    this.drawHighlight = function(actor)
    {
        var loc = this.getCanvasCoords(highlightedActor.state.x, highlightedActor.state.y);
        var r = options.simActorSize*0.75;
        this.ctx.fillStyle = "rgb(255, 187, 0)";
        this.ctx.beginPath();
        this.ctx.arc(loc.x, loc.y, r, 0, 2*Math.PI);
        this.ctx.closePath();
        this.ctx.fill();
        this.drawActor(highlightedActor);
    };
    
    this.getCanvasCoords = function(x,y)
    {
        var result = {};
        result.x = ((x + this.fightOffsetX) * this.scale) + (this.canvas.width/2);
        result.y = ((y + this.fightOffsetY) * this.scale) + (this.canvas.height/2);
        return result;
    };

    this.convertPxToYds = function(x, y)
    {
        var result = {};
        result.x = ((x - this.canvas.width/2)/this.scale) - this.fightOffsetX;
        result.y = ((y - this.canvas.height/2)/this.scale) - this.fightOffsetY;
        return result;
    };
    
    this.closestActor = function(x,y)
    {
        var lowestDist = Number.MAX_VALUE;
        var closest = null;
        for(var a of actors)
        {
            if(a.state === null || a.state instanceof Death)
                continue;

            var loc = this.getCanvasCoords(a.state.x, a.state.y);
            var dx = x - loc.x;
            var dy = y - loc.y;
            var dist = Math.sqrt(dx*dx + dy*dy);
            if((dist < options.simActorSize) && (dist < lowestDist))
            {
                closest = a;
                lowestDist = dist;
            }
        }
        return closest;
    }
};



//class, controls the timeline bar
var TimelineControl = function()
{
    this.canvas = document.getElementById("TimelineCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.mouseX = this.mouseY = null; //position of the mouse cursor over canvas
    this.casts = [];
    //this.phases = [];
    this.deaths = [];
    
    this.init = function()
    {
        this.canvas.style.width = '100%';
        this.canvas.style.height = '35px';//TODO: 100% breaks, should be that going forward?
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.ctx.font = "15px Arial";
    };
    
    this.addIcon = function(time, icon)
    {
        this.casts.push({time:time, draw:function(timeline){
            var size = timeline.canvas.height * 0.7;
            var start = Math.floor((time/encounterInfo.fightLength)*(timeline.canvas.width-114))+114
            turnShadowsOn(timeline.ctx, 3, true, "#FFFFFF");
            timeline.ctx.drawImage(icon, start-size*0.5,
                (timeline.canvas.height-size)/2,size,size);
            turnShadowsOff(timeline.ctx);
        }});
        this.casts.sort(function(a,b){return a.time-b.time;});
    }
    this.addCast = function(cast)
    {
        this.casts.push({time:cast.time + cast.castLength, draw:function(timeline){
            var size = Math.floor(timeline.canvas.height * 0.7);
            var start = Math.floor(((cast.time + cast.castLength)/encounterInfo.fightLength)*(timeline.canvas.width-114))+114
            turnShadowsOn(timeline.ctx, 3, true, "#FFFFFF");
            /*timeline.ctx.drawImage(spells[cast.spellIndex].getasdfIcon(), start-size*0.5,
                (timeline.canvas.height-size)/2,size,size);*/
            iconCache.drawIcon(cast.spellIndex, size, timeline.ctx, start-size*0.5, (timeline.canvas.height-size)/2);
            turnShadowsOff(timeline.ctx);
        }});
        this.casts.sort(function(a,b){return a.time-b.time;});
    }
    this.addDeath = function(color, time)
    {
        this.deaths.push({time:time, draw:function(timeline){  
            var size = timeline.canvas.height*0.25;
            var start = Math.floor((time/encounterInfo.fightLength)*(timeline.canvas.width-114))+114;
            var centerHeight = 0;

            timeline.ctx.fillStyle = "#000000";
            timeline.ctx.beginPath();
            timeline.ctx.moveTo(start, centerHeight);
            timeline.ctx.arc(start, centerHeight, size+1, 0, Math.PI*2);
            timeline.ctx.fill();
            timeline.ctx.fillStyle = color;
            timeline.ctx.beginPath();
            timeline.ctx.moveTo(start, centerHeight);
            timeline.ctx.arc(start, centerHeight, size, 0, Math.PI*2);
            timeline.ctx.fill();
        }});
        this.deaths.sort(function(a,b){return a.time-b.time;});
    };
    
    this.updateMousePosition = function(newMouseX, newMouseY)
    {
        this.mouseX = newMouseX;
        this.mouseY = newMouseY;
    };
    
    this.draw = function()
    {
        if(encounterInfo === null)
        {
            this.ctx.fillStyle = "rgba(0,0,0,0)";
            this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
            return;
        }
        
        //dark grey on the entire bar
        this.ctx.fillStyle = '#444444';
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        //highlight play/pause if mouse is over it
        if(this.mouseX > 0 && this.mouseX <= 20)
        {
            this.ctx.fillStyle = '#999999';
            this.ctx.fillRect(0,0,20,this.canvas.height);
        }
        
        //play button
        this.ctx.fillStyle = '#FFFFFF';
        var top = this.canvas.height * 0.3;
        if(timer === null)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(5,top);
            this.ctx.lineTo(5,top+14);
            this.ctx.lineTo(15,top+7);
            this.ctx.fill();
        }
        //pause button
        else
        {
            this.ctx.fillRect(5,top,3,12);
            this.ctx.fillRect(11,top,3,12);
        }
        
        //divider line between play/pause and time status
        this.ctx.fillStyle="#000000";
        this.ctx.fillRect(20,0,4,this.canvas.height);
        
        //current/max time
        this.ctx.save();
        this.ctx.shadowColor = "#000000";
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = this.ctx.shadowOffsetY = 1;
        this.ctx.fillStyle = "#FFFFFF";
        var timeStatusStr = timeToString(replayTime,0)+" / "+timeToString(encounterInfo.fightLength,0);
        this.ctx.fillText(timeStatusStr, 24+(83-this.ctx.measureText(timeStatusStr).width)/2,(this.canvas.height/2)+5);
        this.ctx.restore();
        
        //divider line between time status and timeline
        this.ctx.fillStyle="#000000";
        this.ctx.fillRect(110,0,4,this.canvas.height);
        
        //color in the phases of the fight
        for(var phase of encounterInfo.phases)
        {
            this.ctx.fillStyle = phase.color;
            var start = Math.floor((phase.time/encounterInfo.fightLength)*(this.canvas.width-114));
            this.ctx.fillRect(114+start,0,this.canvas.width,this.canvas.height);
            
        }
        var thisHelper = this;
        for(var c of this.casts)
            c.draw(thisHelper);
        for(var d of this.deaths)
            d.draw(thisHelper);
        
        //light gray for the played time
        var completePixels = Math.floor((replayTime/encounterInfo.fightLength)*(this.canvas.width-114)) || 0;
        this.ctx.fillStyle = 'rgba(200,200,200,0.7)';
        this.ctx.fillRect(114,0,completePixels, this.canvas.height);

        //white divider line between played and uplayed
        if(replayTime > 0)
        {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(114+completePixels-1, 0, 2, this.canvas.height);
        }
            
        //time at mouse cursor location
        if(this.mouseX >= 114)
        {
            var mouseoverTime = Math.floor(((this.mouseX-114)/(this.canvas.width-114))*encounterInfo.fightLength) || 0;
            var timeString = timeToString(mouseoverTime,1);
            var stringWidth = this.ctx.measureText(timeString).width;
            var stringX = this.mouseX - (stringWidth/2);
            if(stringX < 115)
                stringX = 115;
            if(stringX+stringWidth+2 > this.canvas.width)
                stringX = this.canvas.width-stringWidth-1;
            
            this.ctx.fillStyle = "#0000FF";
            this.ctx.fillRect(this.mouseX,0,1,this.canvas.height);
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.save();
            this.ctx.shadowColor="#000000";
            this.ctx.shadowBlur=3;
            this.ctx.shadowOffsetX = this.ctx.shadowOffsetY = 1;
            this.ctx.fillText(timeToString(mouseoverTime,1), stringX, this.canvas.height-5);
            this.ctx.restore();
        }
    };
    
};

//coordinates drawing objects
var Graphics = function()
{
    this.tooltip = new TooltipControl();
    this.sim = new SimControl("PrimarySimContainer", "PrimarySimCanvas");
    this.timeline = new TimelineControl();
    this.sidebar = new SidebarControl();

    this.init = function()
    {
        this.sim.init();
        this.timeline.init();
        //this.raidFrame.RF.forEach(function(r){r.resizeAuras();});
        this.sidebar.init();
        this.draw(replayTime);
        this.tooltip.reset();
    };
    
    
    this.draw = function(time)
    {
        this.sim.draw(time);
        this.sidebar.step(time);
        this.timeline.draw();
        this.tooltip.update();
    };
    
    this.reset = function()
    {

        var secondSim = document.getElementById("SecondarySimContainer");
        if(secondSim)
        {
            document.getElementById("Sims").removeChild(secondSim);
            var primarySim = document.getElementById("PrimarySimContainer");
            primarySim.style.width = "100%";
            primarySim.style.height = "100%";
        }
        
        this.sim = new SimControl("PrimarySimContainer", "PrimarySimCanvas");
        this.timeline = new TimelineControl();
        this.sidebar.removeHtml();
        this.sidebar = new SidebarControl();
        this.tooltip.reset();
    };
};

var SidebarControl = function()
{
    this.content = new RaidFrameControl();
    
    this.init = function()
    {
        if(this.content !== null)
            this.content.init();
    };
    this.step = function(time)
    {
        if(this.content !== null)
            this.content.step(time);
    };
    this.highlightActor = function(highlightedActor, actor)
    {
        /*if(this.content !== null)
            this.content.highlightActor(highlightedActor, actor);*/
    };
    this.removeHtml = function()
    {
        if(this.content !== null)
            this.content.removeHtml();
    };
    this.changeContent = function()
    {
        //this gets executed on the <select> DOM element
        if(!draw)
            return;
        var container = document.getElementById("sidebar");
        var s = document.getElementById("sidebarContentSelector");
        var sims = document.getElementById("Sims");
        var contentType = s.options[s.selectedIndex].value;
        var header = document.getElementById("header");
        if(draw.sidebar.content !== null)
            draw.sidebar.content.removeHtml();
        if(contentType === "raidFrames")
        {
            sims.style.width = header.style.width = "66%";
            draw.sim.init();
            draw.sim.draw(replayTime);
            
            container.className = "raidFrame";
            draw.sidebar.content = new RaidFrameControl();
            draw.sidebar.content.init();
        }
        else if(contentType === "addDps")
        {
            sims.style.width = header.style.width = "66%";
            draw.sim.init();
            draw.sim.draw(replayTime);
            
            container.className = "combatData"
            draw.sidebar.content = new CombatDataControl();
            draw.sidebar.content.init();
        }
        else//hidden
        {            
            sims.style.width = header.style.width = "100%";
            container.style.width = '0%';
            draw.sim.init();
            draw.sim.draw(replayTime);
            
            container.className = "hiddenSidebar";
            draw.sidebar.content = null;
        }
    }
    document.getElementById("sidebarContentSelector").onchange = this.changeContent;
    this.changeContent();
};

var RaidFrameControl = function()
{
    this.RF = [];
    this.bounds = null;
    this.fontSize = 12;
    this.canvas = null;
    this.ctx = null;
    this.textMeasure = null;
    this.barHeight = 0;
    this.init = function()
    {
        if(this.RF.length === 0)
            this.addActors();
        var sidebar = document.getElementById("sidebar");
        this.bounds = sidebar.getBoundingClientRect();
        this.bounds.width = Math.floor(this.bounds.width);
        if(this.canvas === null)
        {
            this.canvas = document.createElement("canvas");
            sidebar.appendChild(this.canvas);
            var thisRFC = this;
            this.canvas.onmouseenter = function(){draw.tooltip.generateRaidframeTooltip(thisRFC);};
            this.canvas.onmouseleave = function(){draw.tooltip.reset();};
            this.canvas.onclick = function(event)
            {
                for(var rfi = 0; rfi < thisRFC.RF.length; rfi++)
                {
                    if(event.offsetY >= thisRFC.RF[rfi].yOff && event.offsetY <= thisRFC.RF[rfi].yOff+thisRFC.RF[rfi].height)
                    {
                        highlightActor(thisRFC.RF[rfi].actor);
                        return; 
                    }
                }
            };
            this.ctx = this.canvas.getContext('2d');
            this.textMeasure = document.createElement("div");
            this.textMeasure.style = "visibility:hidden; position:absolute; height:auto; width:auto; white-space:nowrap;";
            this.textMeasure.id = "raidFrameTextMeasure";
            sidebar.appendChild(this.textMeasure);
        }
        this.canvas.style.width = this.canvas.width = this.bounds.width;
        this.canvas.style.height = this.canvas.height = this.bounds.height;
        this.canvas.onmousemove = this.mouseoverHandler;
        this.barHeight = Math.floor((this.bounds.height-this.RF.length-1)/this.RF.length);
        
        this.fontSize = Math.floor(this.bounds.height/(this.RF.length*3));
        if(this.fontSize > 15)
            this.fontSize = 15;
        this.canvas.style.font = this.fontSize+"px 'Source Sans Pro', sans-serif";
        this.canvas.font = this.fontSize+"px 'Source Sans Pro', sans-serif";
        this.ctx.fillStyle = "RGB(0,0,0)";
        this.ctx.fillRect(0,0,this.bounds.width, this.bounds.height);

        var extraPixels = (this.bounds.height-this.RF.length-1)%this.RF.length;
        var nextStart = 0;
        for(var rfi = 0; rfi < this.RF.length; rfi++)
        {
            var rf = this.RF[rfi];
            var height = this.barHeight +1+ (extraPixels>0?1:0);
            rf.setSize(nextStart, height, this.bounds.width, this.fontSize, this.ctx, this.canvas);
            nextStart += height;
            extraPixels--;
        }
    }

    this.step = function(time)
    {
        if(!this.ctx)
            return;
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.fillRect(0,0,this.bounds.width, this.bounds.height);
        for(var rfi = 0; rfi < this.RF.length; rfi++)
        {
            this.RF[rfi].step(time);
        }
    };
    this.removeHtml = function()
    {
        var scn = document.getElementById("sidebar").childNodes;
        while(scn.length > 0)
        {
            scn[0].remove();//textMeasure is appeneded to sidebar, this clears it as well
        }
        this.RF = [];
    };

    this.addActors = function()
    {
        var tanks = [];
        var healers = [];
        var meleeDps = [];
        var rangedDps = [];
        var impMobs = [];

        actors.forEach(function(actor)
        {
            if(actor.class instanceof PlayerClass)
            {
                if(actor.class.isTank)
                    tanks.push(actor);
                else if(actor.class.isHealer)
                    healers.push(actor);
                else if(actor.class.isDPS)
                {
                    if(actor.class.isMelee)
                        meleeDps.push(actor);
                    else
                        rangedDps.push(actor);
                }
            }
            else if(actor.class instanceof EncounterMob && actor.class.isImportant)
                impMobs.push(actor);
        });
        
        var alphabetize = function(a,b)
        {
            if(a.name < b.name)
                return -1;
            else if(a.name > b.name)
                return 1;
            else
                return 0;
        }
        this.RF = [];
        var thisHelper = this;
        var addToRf = function(a){thisHelper.RF.push(new RaidFrame(a));};
        impMobs.sort(alphabetize).forEach(addToRf);
        tanks.sort(alphabetize).forEach(addToRf);
        healers.sort(alphabetize).forEach(addToRf);
        meleeDps.sort(alphabetize).forEach(addToRf);
        rangedDps.sort(alphabetize).forEach(addToRf);
    };//addActors()
    this.getAuraUnderMouse = function(mouseX, mouseY)
    {
        var rowIndex = Math.floor(mouseY/(this.barHeight+1));
        if(rowIndex >= this.RF.length)
            return null;
        return this.RF[rowIndex].onMouseover(mouseX, mouseY);
    };

}

var RaidFrame = function(actor)
{
    this.actor = actor;
    this.ctx = this.canvas = this.height = this.width = this.fontSize = this.yOff = null;
    this.actorAuras = null;
    this.actorFrame = {};
    this.targetFrame = {};
    this.targetAuras = null;
    this.castbar = {};

    this.setSize = function(yOffset, height, width, fontSize, ctx, canvas)
    {
        this.yOff = yOffset;
        this.height = height;
        this.fontSize = fontSize;
        this.ctx = ctx;
        this.canvas = canvas;
        this.width = width;

        var auraWidth = this.width/3;
        this.actorAuras = new this.AuraFrame(this.ctx, this.actor, 0, this.yOff, auraWidth, this.height, "actor");
        this.actorFrame.xOff = auraWidth;
        this.actorFrame.width = auraWidth/2;
        this.targetFrame.xOff = auraWidth + auraWidth/2;
        this.targetFrame.width = auraWidth/2;
        this.targetAuras = new this.AuraFrame(this.ctx, this.actor, 2*auraWidth, this.yOff, auraWidth, this.height, "target");
        this.castbar.imgSize = Math.floor(this.height/2);
        this.castbar.imgX = this.width/2 - this.castbar.imgSize/2;
        this.castbar.center = this.width/2;
    }

    this.step = function(time)
    {
        this.drawActor();
        if(!(this.actor.state instanceof Death))
        {
            this.drawTarget();
            this.drawCast(time);
            this.actorAuras.draw(time);
            this.targetAuras.draw(time);
        }
        if(this.actor === highlightedActor)
        {
            this.ctx.strokeStyle = "#FF0";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(0, this.yOff, this.width, this.height);
        }
        else
        {
            this.ctx.strokeStyle = "#FFF";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.yOff + this.height);
            this.ctx.lineTo(this.width, this.yOff+this.height);
            this.ctx.stroke();
        }
    };
    this.drawActor = function()
    {
        if(this.actor.state instanceof State)
        {
            var hpPercent = this.actor.state.curHP/this.actor.state.maxHP;
            if(hpPercent > 1)
                hpPercent = 1;
            this.ctx.fillStyle = this.actor.class.color;
            //this.ctx.fillRect(this.actorFrame.xOff, this.yOff, this.actorFrame.width, this.height);
            this.ctx.fillRect(this.actorFrame.xOff, this.yOff+(this.height*(1-hpPercent)), 
                this.actorFrame.width, this.height*hpPercent);
            var imgSize = this.actor.class.icon.width;

            if(imgSize > this.actorFrame.width || imgSize > this.height)
            {
                imgSize = (this.actorFrame.width<this.height)?this.actorFrame.width:this.height;
            }
            this.ctx.globalAlpha = 0.5;
            this.ctx.drawImage(this.actor.class.icon,
                0, this.actor.class.icon.height*(1-hpPercent), this.actor.class.icon.width, this.actor.class.icon.height*hpPercent,
                this.actorFrame.xOff, this.yOff+(this.height*(1-hpPercent)), imgSize, imgSize*hpPercent);
            this.ctx.globalAlpha = 1;
            
        }
        //draw actor name
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.actorFrame.xOff, this.yOff, this.actorFrame.width, this.height)
        this.ctx.clip();
        this.drawText(this.actor.name, this.actorFrame.xOff, this.yOff+this.fontSize, false);
        if(this.actor.state instanceof State)
            this.drawText(numToShortStr(this.actor.state.curHP), this.actorFrame.xOff, this.yOff+(this.fontSize*2), true);
        this.ctx.restore();
    };
    this.drawTarget = function()
    {
        var target = this.actor.target;
        if(target === null)
            return;
        if(target.state instanceof State)
        {
            var hpPercent = target.state.curHP/target.state.maxHP;
            if(hpPercent > 1)
                hpPercent = 1;
            this.ctx.fillStyle = target.class.color;

            this.ctx.fillRect(this.targetFrame.xOff, this.yOff+(this.height*(1-hpPercent)), 
                this.targetFrame.width, this.height*hpPercent);
            var imgSize = target.class.icon.width;

            if(imgSize > this.targetFrame.width || imgSize > this.height)
            {
                imgSize = (this.targetFrame.width<this.height)?this.targetFrame.width:this.height;
            }
            var imgOffset = 0;
            if(imgSize < this.targetFrame.width)
                imgOffset = this.targetFrame.width - imgSize;
            this.ctx.globalAlpha = 0.5;
            this.ctx.drawImage(target.class.icon,
                0, target.class.icon.height*(1-hpPercent), target.class.icon.width, target.class.icon.height*hpPercent,
                this.targetFrame.xOff+imgOffset, this.yOff+(this.height*(1-hpPercent)), imgSize, imgSize*hpPercent);
            this.ctx.globalAlpha = 1;
            
        }
        //draw actor name
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(this.targetFrame.xOff, this.yOff, this.targetFrame.width, this.height)
        this.ctx.clip();
        this.ctx.font = this.canvas.style.font = this.fontSize+"px 'Source Sans Pro', sans-serif";
        var txtLen = this.ctx.measureText(target.name).width;
        var txtOff = 0;
        if(this.targetFrame.width - txtLen > 3)
        {
            txtOff = this.targetFrame.width - txtLen - 3;
        }
        this.drawText(target.name, this.targetFrame.xOff+txtOff, this.yOff+this.fontSize, false);
        if(target.state instanceof State)
        {
            this.ctx.textAlign = "end";
            this.drawText(Math.floor(hpPercent*100)+"%", this.targetFrame.xOff+this.targetFrame.width,
                this.yOff+(this.fontSize*2), true, null, true);
        }
        this.ctx.restore();
    };
    this.drawCast = function(time)
    {
        var textPadding = -2;
        var cast = this.actor.cast;
        if(cast === null)
            return;
        if(time-cast.time > 2000+cast.castLength)
            return;
        iconCache.drawIcon(cast.spellIndex, this.castbar.imgSize, this.ctx, this.castbar.imgX, this.yOff+(this.castbar.imgSize*0.6))
        /*this.ctx.drawImage(spells[cast.spellIndex].getIconASDF(),
            this.castbar.imgX, this.yOff+(this.castbar.imgSize*0.6), this.castbar.imgSize, this.castbar.imgSize);*/
        this.ctx.font = this.canvas.style.font = this.fontSize+"px 'Source Sans Pro', sans-serif";
        var txtLen = this.ctx.measureText(spells[cast.spellIndex].name).width;
        var txtX = this.castbar.center-(txtLen/2);
        var castPercent = 0;
        var txtColor = "RGBA(255,255,255,1)";
        if(cast.castLength === 0)
        {
            castPercent = (time-cast.time)/250;
            txtColor = "RGBA(0,255,0,1)";
        }
        else
        {
            castPercent = (time-cast.time)/cast.castLength;
            if(!cast.didCastSucceed)
                txtColor = "RGBA(255,0,0,1)";
        }
        if(castPercent < 0)
            castPercent = 0;
        if(castPercent > 1)
            castPercent = 1;
        
        this.drawText(spells[cast.spellIndex].name, txtX, this.yOff+this.height+textPadding, false, "rgba(0,0,0,1)");
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(txtX, this.yOff, (txtLen*castPercent)+1, this.height)
        this.ctx.clip();
        this.drawText(spells[cast.spellIndex].name, txtX, this.yOff+this.height+textPadding, false, txtColor);
        this.ctx.restore();
    };

    this.drawText = function(text, x, y, monospace, textColor, rightAligned)
    {
        if(monospace === true)
            this.ctx.font = this.canvas.style.font = this.fontSize+"px 'Source Code Pro', monospace";
        else
            this.ctx.font = this.canvas.style.font = this.fontSize+"px 'Source Sans Pro', sans-serif";
        this.ctx.fillStyle = "RGBA(0,0,0,0.7)";
        var txtWidth = this.ctx.measureText(text).width;
        var rightAlignedOffset = (rightAligned) ? (txtWidth*-1) : 0;
        this.ctx.fillRect(x+rightAlignedOffset, y-this.fontSize+2, txtWidth, this.fontSize-1);

        this.ctx.fillStyle = textColor?textColor:"RGBA(255,255,255,1)";
        this.ctx.fillText(text, x, y);
    };
    /*this.measureText = function(text, monospace)
    {
        var ctxMeasure = this.ctx.measureText(text).width;
        var div = document.getElementById("raidFrameTextMeasure");
        if(monospace === true)
            div.style.font = this.fontSize+"px 'Source Code Pro', monospace";
        else
            div.style.font = this.fontSize+"px 'Source Sans Pro', sans-serif";
        div.innerHTML = text;
        var divMeasure = div.clientWidth;

        var delta = ctxMeasure-divMeasure;
        if(delta < -10 || delta > 10)
            console.log(delta + " : "+ text);
        return ctxMeasure;
        //return 5;
    };*/
    this.onMouseover = function(mouseX, mouseY)
    {
        if(mouseX >= this.actorAuras.xOff && mouseX <= this.actorAuras.xOff+this.actorAuras.width)
        {
            return this.actorAuras.onMouseover(mouseX, mouseY);
        }
        else if(mouseX >= this.targetAuras.xOff && mouseX <= this.targetAuras.xOff+this.targetAuras.width)
        {
            return this.targetAuras.onMouseover(mouseX, mouseY);
        }
        else
            return null;
    };


    this.AuraFrame = function(ctx, actor, xOff, yOff, width, height, actorOrTarget)
    {
        this.ctx = ctx;
        this.xOff = xOff;
        this.yOff = yOff;
        this.width = width;
        this.height = height;
        this.actor = actor;
        this.activeAuras = null;
        this.iconSize = null;
        this.iconsPerRow = null;
        this.selectorFunc = function(){return [];};
        this.draw = function(time)
        {
            if(this.actor.state instanceof Death)
                return;
            if(this.actor.change.auras || this.activeAuras === null)
            {
                this.activeAuras = this.selectorFunc(this);
                if(this.activeAuras.length === 0)
                    return;
                var iterationCount = 1;
                this.iconSize = Math.floor((missing.width > this.height) ? this.height : missing.width);
                this.iconsPerRow = this.activeAuras.length;
                while((this.iconSize * this.iconsPerRow > this.width) || (this.iconsPerRow * iterationCount < this.activeAuras.length))
                {
                    iterationCount++;
                    this.iconSize = Math.floor(this.height/iterationCount);
                    this.iconsPerRow = Math.floor(this.width/this.iconSize);
                    if(iterationCount > 200)
                        return;
                }
            }
            var x = this.xOff;
            var y = this.yOff;
            for(var auraI = 0; auraI < this.activeAuras.length; auraI++)
            {
                var aura = this.activeAuras[auraI];
                /*var icon = spells[aura.spellIndex].getIcon ();
                this.ctx.drawImage(icon, x, y, this.iconSize, this.iconSize);*/
                iconCache.drawIcon(aura.spellIndex, this.iconSize, this.ctx, x, y);
                var percentComplete = (time - aura.timeApplied)/(aura.timeRemoved-aura.timeApplied);
                drawCooldownSpiral(this.ctx, x, y, this.iconSize, percentComplete);

                if(aura.stacks)
                {
                    turnShadowsOn(this.ctx);
                    this.ctx.font = Math.floor(this.iconSize*0.6)+"px Arial";
                    this.ctx.fillStyle = "#FFFFFF";
                    var textX = x+((aura.stacks >= 10)?0:(this.iconSize*0.3));
                    var textY = y+(this.iconSize*0.8);
                    this.ctx.fillText(aura.stacks+"", textX, textY);
                    turnShadowsOff(this.ctx);
                }       

                this.ctx.strokeStyle = (aura.isBuff)?"green":"red";
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, this.iconSize, this.iconSize);
                x += this.iconSize;
                if(x+this.iconSize >= this.xOff+this.width)
                {
                    x = this.xOff;
                    y += this.iconSize;
                }
            }

        };
        this.setSelection = function(actorOrTarget)
        {
            if(actorOrTarget.toLowerCase() === "actor")
            {
                this.selectorFunc = this.selectAuras_selfBuffsAllDebuffs;
            }
            else
            {
                this.selectorFunc = this.selectAuras_targetDebuffs;
            }

        };
        this.selectAuras_selfBuffsAllDebuffs = function(thisCtx)
        {
            if(!thisCtx.actor.activeAuras)
                return [];
            var selfBuffs = [];
            var allDebuffs = [];
            thisCtx.actor.activeAuras.forEach(function(a){
                if(a.isBuff && actors[a.source] === thisCtx.actor)
                    selfBuffs.push(a);
                else if(!a.isBuff)
                    allDebuffs.push(a);
            });
            var sortByTime = function(a,b)
            {
                return b.timeRemoved - a.timeRemoved;
            };
            return selfBuffs.sort(sortByTime).concat(allDebuffs.sort(sortByTime));
        };
        this.selectAuras_targetDebuffs = function(thisCtx)
        {
            if(thisCtx.actor.target === null)
                return [];
            if(!thisCtx.actor.target.activeAuras)
                return [];
            var auras = [];
            thisCtx.actor.target.activeAuras.forEach(function(a){
                if(actors[a.source] === thisCtx.actor)
                {
                    auras.push(a);
                }
            });
            var sortByTime = function(a,b)
            {
                return b.timeRemoved - a.timeRemoved;
            };
            return auras.sort(sortByTime);
        };
        this.onMouseover = function(mouseX, mouseY)
        {
            var relX = mouseX - this.xOff;
            var relY = mouseY - this.yOff;
            if(this.activeAuras === null || this.activeAuras.length === 0)
                return null;
            var aurasPerLine = Math.floor(this.width/this.iconSize);
            if(relX > aurasPerLine * this.iconSize)
                return null;
            var mouseRow = Math.floor(relY/this.iconSize);
            var auraIndex = mouseRow*this.iconsPerRow + Math.floor(relX/this.iconSize);
            if(isNaN(auraIndex) || auraIndex < 0 || auraIndex >= this.activeAuras.length)
                return null;
            return this.activeAuras[auraIndex];
        };
        this.setSelection(actorOrTarget);//finish init
    };//AuraFrame()
}//RaidFrame()

function turnShadowsOn(ctx, size, centered, color)
{
    if(color === undefined)
        ctx.shadowColor = "black";
    else
        ctx.shadowColor = color;
    var offset = (centered===true)?0:2;
    if(size === undefined)
        size = 2;
    ctx.shadowOffsetX = offset; 
    ctx.shadowOffsetY = offset; 
    ctx.shadowBlur = size;
};
function turnShadowsOff(ctx)
{
    ctx.shadowOffsetX = 0; 
    ctx.shadowOffsetY = 0; 
    ctx.shadowBlur = 0;
};
function drawCooldownSpiral(ctx, x, y, iconSize, percentComplete, fillColor)
{
    fillColor = fillColor || "rgba(0,0,0,0.75)";
    var centerX = x+(iconSize/2);
    var centerY = y+(iconSize/2);
    var halfSize = iconSize/2;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);//center
    ctx.lineTo(centerX, y);//top-middle
    if(percentComplete <= 0.125)// 1/8
    {
        var lineSegment = (percentComplete/0.125)*halfSize;
        ctx.lineTo(centerX+lineSegment, y);//fraction of top-right
    }
    else
    {
        ctx.lineTo(x+iconSize, y);//top-right corner
        if(percentComplete <= 0.375)// 3/8
        {
            var lineSegment = ((percentComplete-0.125)/0.25)*iconSize;
            ctx.lineTo(x+iconSize, y+lineSegment);
        }
        else
        {
            ctx.lineTo(x+iconSize, y+iconSize);//bottom-right corner
            if(percentComplete <= 0.625)// 5/8
            {
                var lineSegment = ((percentComplete- 0.375)/0.25)*iconSize;
                ctx.lineTo(x+iconSize-lineSegment, y+iconSize);
            }
            else
            {
                ctx.lineTo(x, y+iconSize);// bottom-left corner
                if(percentComplete <= 0.875)// 7/8
                {
                    var lineSegment = ((percentComplete - 0.625)/0.25)*iconSize;
                    ctx.lineTo(x, y+iconSize-lineSegment);
                }
                else
                {
                    ctx.lineTo(x,y);//top-left corner
                    lineSegment = ((percentComplete-0.875)/0.125)*halfSize;
                    ctx.lineTo(x+lineSegment, y);
                }
            }
        }
    }
    ctx.closePath();
    ctx.fill();
};

var CombatDataControl = function()
{
    this.damageWindow = null;//list of the times we're looking at add damage
    this.dpsPlayers = null;//save a list of the DPS players to refer back to later
    this.htmlWritten = false;//init may be called multiple times, keep track if it has happened once
    
    this.init = function()
    {
        if(this.htmlWritten)
            return;
        this.htmlWritten = true;
        this.initData();
        var s = document.getElementById("sidebar");
        s.style.fontSize = "1.3rem"
        s.style.width = "33%";

        var str = "";
        if(this.damageWindow === null || this.damageWindow.length === 0)
        {
            s.innerHTML = "<div class='alert alert-warning'>No adds detected for this fight.</div>";
            return;
        }
        for(var window of this.damageWindow)
        {
            var windowDiv = document.createElement("div");
            windowDiv.className = "combatDataWindow";
            var title = document.createElement("div");
            title.className = "combatDataWindowTitle";
            var mobImageContainer = document.createElement("div");
            mobImageContainer.appendChild(window.actors[0].class.icon);
            mobImageContainer.style = "float:left;";
            title.appendChild(mobImageContainer);
            title.innerHTML += "<div style='float:left;'><b>"+window.title+"</b><br>"+
                    timeToString(window.startTime)+" - "+timeToString(window.endTime)+"</div>";;

            windowDiv.appendChild(title);
            for(var dps of window.data)
            {
                var nameAndDamage = "";
                nameAndDamage += "<img style='height:1.5em;' src='"+dps.source.class.icon.src+"'></img>"
                nameAndDamage += "<b>"+dps.source.name+" "+numToShortStr(dps.targetDamage)+"</b> (";
                nameAndDamage += (Math.floor(dps.targetDamage/dps.totalDamage*100)||0);
                nameAndDamage += "% dmg)";
                nameAndDamage += " ["+dps.targetCasts+"/"+dps.totalCasts+" casts]"; 
                
                var playerEntry = document.createElement("div");
                playerEntry.className = 'combatDataWindowEntry';
                
                var blackBase = document.createElement("div");
                blackBase.className = 'combatDataWindowEntryCover';
                blackBase.style.width = "100%";
                blackBase.innerHTML = nameAndDamage;
                
                var colorOverlay = document.createElement("div");
                colorOverlay.className = 'combatDataWindowEntryCover';
                //colorOverlay.style.width="20%";
                if(window.data[0].targetDamage === 0)
                    colorOverlay.style.width = "0%";
                else
                {
                    var w = (dps.targetDamage/window.data[0].targetDamage*100).toFixed(1);
                    colorOverlay.style.width = (w)+"%";
                }
                
                var colorOverlayText = document.createElement("div");
                colorOverlayText.style.width = "9999px";
                colorOverlayText.style.backgroundColor = dps.source.class.color;
                colorOverlayText.style.color ="#000000";
                colorOverlayText.innerHTML = nameAndDamage;
                
                colorOverlay.appendChild(colorOverlayText);
                playerEntry.appendChild(blackBase);
                playerEntry.appendChild(colorOverlay);
                
                windowDiv.appendChild(playerEntry);
            }
            s.appendChild(windowDiv);
        }
    };
    
    
    
    this.removeHtml = function()
    {
        document.getElementById("sidebar").innerHTML = "";
    };
    
    this.highlightActor = function(){};
    this.step = function(){};
    
    this.initData = function()
    {
        this.damageWindow = [];
        this.dpsPlayers = [];
        for(var a of actors)
        {
            if(a.class.isDPS)
                this.dpsPlayers.push(a);
        }
        if(encounterInfo && encounterInfo.setupCombatData)
        {
            encounterInfo.setupCombatData(this);
            this.readActions();
        }
    }
    
    this.readActions = function()
    {
        for(var window of this.damageWindow)
        {
            window.data = [];
            for(var actor of this.dpsPlayers)
            {
                var totalDamage = totalCasts = targetDamage = targetCasts = 0;
                var AA = actor.damageDone.AA;
                for(var ai = AA.binarySearch(window.startTime); ai < AA.length-1 && AA[ai].time < window.endTime; ai++)
                {
                    totalDamage += AA[ai].ammount;
                    for(var target of window.actors)
                    {
                        if(target === actors[AA[ai].target])
                        {
                            targetDamage += AA[ai].ammount;
                            break;
                        }
                    }
                }
                var CA = actor.casts.CA;
                for(var ci = CA.binarySearch(window.startTime); ci < CA.length-1 && CA[ci].time < window.endTime ; ci++)
                {
                    if(!CA[ci].didCastSucceed)
                        continue;
                    totalCasts++;
                    for(var target of window.actors)
                    {
                        if(target === CA[ci].target)
                        {
                            targetCasts++;
                            break;
                        }
                    }
                }
                window.data.push({source:actor, targetDamage:targetDamage, totalDamage:totalDamage,
                    targetCasts:targetCasts, totalCasts:totalCasts});
            }//for dpsPlayers
            //sort the array, by target dmg, then number of casts
            window.data.sort(function(a,b){
                var dmgDiff = b.targetDamage-a.targetDamage;
                if(dmgDiff === 0)
                {
                    dmgDiff = b.targetCasts-a.targetCasts;
                    if(dmgDiff === 0)
                        dmgDiff = b.totalCasts-a.totalCasts;
                }
                return dmgDiff;
            });
        }//for window
    };
    
    //2 ways to call this function, either with (mobName, (opt)maxTime), or (null, (opt)maxTime, className)
    this.addDamageWindow = function(mobIDs, maxTimeWindow)
    {
        if(Number.isInteger(mobIDs))
            mobIDs = [mobIDs];

        maxTimeWindow = maxTimeWindow || 10000;
        var selectedActors = [];

        for(var ai = 0; ai < actors.length; ai++)
        {
            for(var mi = 0; mi < mobIDs.length; mi++)
            {
                if(actors[ai].class.mobID === mobIDs[mi] && actors[ai].states.SA.length !== 0)
                    selectedActors.push(actors[ai]);
            }

        }
        if(selectedActors.length === 0)//so we can safely assume later on the array is non-empty
            return;

        selectedActors.sort(function(a,b){return a.states.SA[0].time - b.states.SA[0].time;});
        var actorGroups = [];
        var tmpNames = {};
        tmpNames[selectedActors[0].name] = 1;
        actorGroups.push({startTime:selectedActors[0].states.SA[0].time, 
                            endTime:selectedActors[0].states.SA[selectedActors[0].states.SA.length-1].time,
                            actors:[selectedActors[0]],
                            names:tmpNames});

        for(var ai = 1; ai < selectedActors.length; ai++)
        {
            var sa = selectedActors[ai];
            if(sa.states.SA[0].time - actorGroups[actorGroups.length-1].startTime > maxTimeWindow)
            {
                tmpNames = {};
                tmpNames[sa.name] = 1;
                actorGroups.push({startTime:sa.states.SA[0].time, 
                    endTime:sa.states.SA[sa.states.SA.length-1].time,
                    actors:[sa],
                    names:tmpNames});
            }
            else
            {
                var groupToUpdate = actorGroups[actorGroups.length-1];
                groupToUpdate.actors.push(sa);
                if(groupToUpdate.endTime < sa.states.SA[sa.states.SA.length-1].time)
                    groupToUpdate.endTime = sa.states.SA[sa.states.SA.length-1].time;

                if(groupToUpdate.names[sa.name] === undefined)
                   groupToUpdate.names[sa.name] = 1;
                else
                    groupToUpdate.names[sa.name]++;
            }
        }
        for(var gi = 0; gi < actorGroups.length; gi++)
        {
            var groupTitle = "";
            Object.getOwnPropertyNames(actorGroups[gi].names).forEach(function(val, idx, array){
                //comma seperate the later names
                if(idx !== 0)
                    groupTitle += ", ";
                //include the number of each type
                if(actorGroups[gi].names[val] !== 1)
                    groupTitle += actorGroups[gi].names[val]+" ";
                //append the name
                groupTitle += val;
            });
            groupTitle += " #"+(gi+1);
            actorGroups[gi].title = groupTitle;
        }
        this.damageWindow = this.damageWindow.concat(actorGroups);
        this.damageWindow.sort(function(a,b){return a.startTime-b.startTime;});
    };//addDamageWindow()
};

