var uploader = function(http, app)
{
	var Mode = require('./db.js');
	var io = require('socket.io')(http);
	var mostRecentUpload = [{name:"missing",file:""}];

	app.post("/uploadFight", function(req,res){
		if(!req.isAuthenticated())
		{
			return res.status(201).send("User not authenticated, unable to upload data.");
		}
		var bodyData = "";
		req.on('data', function(data){
			bodyData += data;
		});
		req.on('end', function(){
			bodyData = decodeURI(bodyData);
			bodyData = JSON.parse(bodyData);
			bodyData.uploaderId = req.user.id;
			mostRecentUpload = [{name:bodyData.pullTime.toString(), file:bodyData.data}];
			sharedRoom.emit("getMostRecent", mostRecentUpload);
			new Mode.fight().save(bodyData)
				.then(function(model){
					res.status(201).send("Upload Successful");
				},function(err){
					res.status(500).send("Upload failed: "+err.code);
				}
			);
		});
	});

	
	var groupView = io.of('/groupView');
	sharedRoom.on('connection', function(socket){
		socket.emit("getMostRecent", mostRecentUpload);
		socket.on('playstateChange', function(msg){
			socket.broadcast.emit('playstateChange', msg);
		});
	});
};

module.exports = uploader;