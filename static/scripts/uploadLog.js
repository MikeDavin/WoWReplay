var fights = [];//save the results
var file;

var initSplitLog = function()
{
    document.getElementById("fileSelect").addEventListener('change', splitLog, false);
};

var saveAll = function()
{
    var fightIndex = 0;
    if(!fights[fightIndex])
        return;

    var saveFight = function()
    {
        if(!fights[fightIndex])
            return;
        var reader = new FileReader();
        reader.onload = function(event)
        {
            if(event.target.error === null)
            {
                var fightString = fights[fightIndex].trimFight(event.target.result);
                uploadFightToServer(fightString, fights[fightIndex].statusDiv);
                fightIndex++;
                saveFight();
            }
            else
            {
                fights[fightIndex].statusDiv.innerHTML = "Error uploading fight: "+ event.target.error;
            }
        };
        data = file.slice(fights[fightIndex].roughStart, fights[fightIndex].roughEnd);
        reader.readAsText(data);
    };
    saveFight();
};



var splitLog = function(event)
{
    fights = [];
    file = event.target.files[0];
    document.getElementById("progressBarCover").style.width = "0%";
    document.getElementById("output").innerHTML = "";


    
    var parser = new chunkReader();
    var chunkSize = 1000*1024;//1mb
    var offset = 0;
    
    var readNextBlock = function()
    {
        var reader = new FileReader();
        var data = file.slice(offset, offset+chunkSize);
        reader.onload = function(event)
        {
            if(event.target.error === null)
            {
                parser.readChunk(event.target.result, offset, chunkSize);
                offset += chunkSize;
                document.getElementById("progressBarCover").style.width = Math.ceil(offset/file.size*100)+"%"; 
            }
            else
            {
                console.log("Read File error: "+event.target.error);
                return;
            }
            if(offset >= file.size)
            {
                var saveAllButton = document.createElement("button");
                saveAllButton.onclick = saveAll;
                saveAllButton.className = 'btn btn-lg btn-warning';
                saveAllButton.style.margin = 'auto';
                saveAllButton.style.display ='block';
                saveAllButton.innerHTML = '<span class="glyphicon glyphicon-upload"></span> Upload All';
                document.getElementById('output').appendChild(saveAllButton);
                document.getElementById('output').appendChild(document.createElement("br"));

                document.getElementById("progressBarCover").style.width = "100%";
                fights.forEach(function(e){e.generateSaveButton(e);});
                return;
            }
            readNextBlock();
        };
        reader.readAsText(data);
    };
    readNextBlock();
};

var chunkReader = function()
{
    this.leftoverString = "";
    this.startFileOffset;
    this.startChunkOffset;

    this.readChunk = function(newString, fileOffset, chunkSize)
    {
        var nextNewline = 0;
        var lastNewline = 0;
        var line;
        newString = this.leftoverString + newString;

        while(-1 !== (nextNewline = newString.indexOf('\n', lastNewline)))
        {
            line = newString.substr(lastNewline, nextNewline - lastNewline);
            
            this.readLine(line, fileOffset, chunkSize, lastNewline);
            lastNewline = nextNewline+1;
        }
        this.leftoverString = newString.substr(lastNewline); 
    };
    this.readLine = function(line, fileOffset, chunkSize, chunkOffset)
    {
        var splitLine = line.split("  ");
        if(splitLine.length !== 2)
        {
            console.log("chunkReader.readLine: good chance file is getting corrupted!");
            return;
        }
        
        if(splitLine[1].startsWith("ENCOUNTER_START"))
        {
            this.firstLine = splitLine;
            this.startFileOffset = fileOffset-2000;//in case the line was split by previous chunk
            this.startChunkOffset = chunkOffset-2000;
            if(this.startFileOffset < 0)
                this.startFileOffset = 0;
            if(this.startChunkOffset < 0)
                this.startChunkOffset = 0;
        }
        else if(splitLine[1].startsWith("ENCOUNTER_END"))
        {
            fights.push(new FightChunk(
                    //start                  chunkStart             end        
                    this.startFileOffset, this.startChunkOffset, fileOffset+chunkSize,
                    this.firstLine, splitLine));
        }
    };
};

var FightChunk = function(roughStart, chunkOffset, roughEnd, firstLine, lastLine)
{
    this.roughStart = roughStart;
    this.chunkOffset = chunkOffset;
    this.roughEnd = roughEnd;
    this.htmlButton;
    this.statusDiv;
    
    this.encounter = new Encounter(firstLine);
    this.encounter.fightLength = createDate(lastLine[0]) - createDate(firstLine[0]);
    this.encounter.encounterWon = (lastLine[1].splitPerserveQuotedCommas()[5][0]==='1');
   
    //  text/plain
    this.generateSaveButton = function(fightObject)
    {
        var outputDiv = document.getElementById("output");

        fightObject.htmlButton = document.createElement("button");
        fightObject.htmlButton.innerHTML = fightObject.encounter.getFileName();
        if(fightObject.encounter.encounterWon)
            fightObject.htmlButton.className = 'btn btn-xs btn-success';
        else
            fightObject.htmlButton.className = 'btn btn-xs btn-danger';
        fightObject.statusDiv = document.createElement('div');
        fightObject.statusDiv.style.display = "inline-block";

        fightObject.htmlButton.onclick = function()
        {
            var reader = new FileReader();
            reader.onload = function(event)
            {
                if(event.target.error === null)
                {
                    var fightString = fightObject.trimFight(event.target.result);
                    uploadFightToServer(fightString, fightObject.statusDiv);
                }
                else
                {
                    fightObject.statusDiv.innerHTML = "Error reading in fight: "+ event.target.error;
                }
            };
            var data = file.slice(fightObject.roughStart, fightObject.roughEnd);
            reader.readAsText(data);

        };

        outputDiv.appendChild(fightObject.htmlButton);
        outputDiv.appendChild(fightObject.statusDiv);
        outputDiv.appendChild(document.createElement("br"));
    };
    
    this.trimFight = function(fightString)
    {
        var nextNewline = 0;
        var lastNewline = this.chunkOffset;
        var result = "";
        var foundTheData = false;

        while(-1 !== (nextNewline = fightString.indexOf('\n', lastNewline)))
        {
            var line = fightString.substr(lastNewline, nextNewline - lastNewline+1);
            var splitLine = line.split("  ");
            if(splitLine.length !== 2)
            {
                lastNewline = nextNewline+1;
                continue;
            }
            if(splitLine[1].startsWith("ENCOUNTER_START"))
            {
                foundTheData = true;
            }
            if(foundTheData)
            {
                result += line;
            }
            if(splitLine[1].startsWith("ENCOUNTER_END") && foundTheData)
            {
                break;
            }
            lastNewline = nextNewline+1;
        }
        return result;
    };
};


