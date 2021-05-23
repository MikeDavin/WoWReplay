var file;
var lastSeenFileSize;
var fightInProgress = null;
var timer;
var fileStatus;

var initLivelog = function()
{
    document.getElementById("fileSelect").addEventListener('change', startLivelog, false);
    fileStatus = document.getElementById("fileStatus");
    //most strings from the logs are enclosed in quotes, remove them
    String.prototype.removeExtraQuotes = function()
    {  
	    var end = this.length-1;
	    return this.substr((this[0]==='"'?1:0), (this[end]==='"'?end-1:end+1));
    };
};

var startLivelog = function(event)
{
    file = event.target.files[0];
    if(!file.type.startsWith("text"))
    {
        fileStatus.innerHTML = "Error: incorrect file type: "+ file.type;
        return;
    }
    lastSeenFileSize = file.size;
    fileStatus.innerHTML = "Reading File, size: "+file.size+" last modified: "+file.lastModifiedDate;
    //checkFrequency
    var s = document.getElementById("checkFrequency");
    timer = setInterval(checkForChanges,3000);
};

var checkForChanges = function()
{
    if(file.size < lastSeenFileSize)
    {
        clearInterval(timer);
        timer = null;
        fileStatus.innerHTML = "Error: file size decreased, restart livelog to continue";
    }
    if(file.size === lastSeenFileSize)
    {
        fileStatus.innerHTML = new Date().toLocaleTimeString()+" - No changes.";
    }
    if(file.size > lastSeenFileSize)
    {
        fileStatus.innerHTML = new Date().toLocaleTimeString()+" - New data in file." 
        var reader = new FileReader();
        var data = file.slice(lastSeenFileSize);
        reader.onload = function(event)
        {
            if(event.target.error)
            {
                fileStatus.innerHTML = new Date().toLocaleTimeString()+"Error reading file: "+event.target.error;
                return;
            }
            readLog(event.target.result);
        };
        reader.readAsText(data);
        lastSeenFileSize = file.size;
    }
};

var readLog = function(newData)
{
    newData = newData.split("\n");
    for(var line of newData)
    {
        lineParts = line.split("  ");
        if(lineParts.length !== 2)
        {
            continue;
        }
        if(lineParts[1].startsWith("ENCOUNTER_START"))
        {
            if(fightInProgress !== null)
                fileStatus.innerHTML += " readLog Error: new fight begun before old fight completed, discarding old data";
            startTime = createDate(lineParts[0]);
            fightInProgress = line +"\n";
        }
        else if(lineParts[1].startsWith("ENCOUNTER_END"))
        {
            if(fightInProgress === null)
            {
                fileStatus.innerHTML += " readLog Error: end of encounter found without start.";
                return;
            }
            fightInProgress += line+"\n";
            var uploadStatus = document.createElement('div');
            uploadStatus.className = 'panel-body';
            document.getElementById('uploadPanel').insertAdjacentElement('afterbegin',uploadStatus);
            uploadFightToServer(fightInProgress, uploadStatus, true);
            fightInProgress = null;
        }
        else if(fightInProgress !== null)
            fightInProgress += line+"\n";
    }
};