var http = require("http");

var net = require("net");



var qs = require("querystring")
var HashMap = require('hashmap')
var publicIp = require("public-ip");
var serverStart = require("./startup_procedures.js");

var users = new HashMap();
var nameTags = new HashMap();

var baudRate = 1/10;
const PORT = 8081;

var ipAddress = "";
var localIP = "";

publicIp.v4().then(ipAddress => {
	localIP = serverStart.getAddress();
    console.log("---------------------------------------------\n" + "Server running\n\n" + "Public Address - " + ipAddress + ":" + PORT + "\nLocal Address  - " + localIP +":" + PORT + "\n---------------------------------------------");
});

ipAddress = ipAddress.toString();


var tcp = net.createServer(function(socket)
{
	socket.write('tcp connected\r\n');
	socket.pipe(socket);	
	
	socket.on('data', function(data)
	{
		try
		{
			var replyString = "Invalid request";
			
			console.log(data.toString());
			
			data = data.toString().split(" ");
			
			var command = data[0];
			console.log(command);
			if(command === "A_REQUEST_CONNECT")
			{
				replyString = "SEND_CONNECT_REQUIREMENTS " + sensorString;		
			}
			
			else if(command === "A_CONNECT")
			{
				
			}
			
			else if(command === "A_UPDATE_SETTINGS")
			{
				
			}
			
			else if(command === "A_UPLOAD")
			{
				
			}
		}
		
		catch(err)
		{
			console.log(err.toString());
		}
	});
	
})

tcp.on('data', function(data){
	console.log("Connected");
});

tcp.on('error', (err)=>{
	console.log(err);
});

tcp.listen(8080);

var outString = serverStart.defineSensorString();
console.log(outString);

http.createServer(function (request, response) 
{	
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   var replyString = "doesn't seem like you're asking for anything valid right now";
   if(request.method == "POST")
   {
	   var body = "";
	   
	   request.on("data", function(data) {
		   body += data;
		   //console.log(data);
		   var post = qs.parse(body);
		   //console.log(post);
		   
		   //data = data.toString();
		   //var splitData = data.split('u');
		   
		   //console.log(splitData.length);
		   
		   
		   
		   var command = body.toString();
		   //console.log("COMMAND" + command);
		   command = command.split(",");
		   //console.log(command[0])
		   
		   //Process a connection command from a new Android User
		   if(command[0] === "CONNECT")
		   {
			   console.log("Connection attempt from: \"" + command[0] + "\"");
			   
			   
			   if(command[1] !== "")
			   {
				   users.set(command[1], [Math.random() % 20, Math.random() % 20, Math.random() % 20, 0, 0, 0]);
				   
				   console.log("User: \"" + command[1] + "\" connected");
				   replyString = "connection successful";
			   }
			   
			   else
			   {
					replyString = "connection failed";
			   }
			   
		   }
		   
		   //Process an UPLOAD command. Should be and android uploading acceleration data
		   else if(command[0] === "UPLOAD")
		   {
			   var ID = command[1];
			   var xAccel = parseFloat(command[2]);
			   var yAccel = parseFloat(command[3]);
			   var zAccel = parseFloat(command[4]);
			   
			   if(users.has(command[1]))
			   {
				   //console.log("Update user: \"" + command[1] + "\"");
				   
				   var currentValues = users.get(ID);
				   
				   var x = currentValues[0];
				   var y = currentValues[1];
				   var z = currentValues[2];
				   var xVel = currentValues[3];
				   var yVel = currentValues[4];
				   var zVel = currentValues[5];
				   
				   //Apply previous velocity over previous step and current acceleration to position
				   x += xVel * baudRate;// + (xAccel * Math.pow(baudRate, 2));
				   y += yVel * baudRate;// + (yAccel * Math.pow(baudRate, 2));
				   z += zVel * baudRate;// + (yAccel * Math.pow(baudRate, 2));
				   
				   //Update acceleration by current acceleration over previous time step
				   xVel += xAccel * baudRate;
				   xVel *= 0.9;
				   yVel += yAccel * baudRate;
				   yVel *= 0.9;
				   zVel += zAccel * baudRate;
				   zVel *= 0.9;
				   
				   var newCoords = [x, y, z, xVel, yVel, zVel];
				   users.set(command[1], newCoords);
				   //console.log("User \"" + ID + "\" Updated to\t x: " + x + " y: " + y + " z: " + z + "\n xVel: " + xVel + " yVel: " + yVel + " zVel: " + zVel + " \nxAccel: " + xAccel + " yAccel: " + yAccel + " zAccel " + zAccel + "\n=================================================\n");
			   }
			   
			   else{
				   console.log("User \"" + command[1] + "\" not found!");
				   replyString = "user not found";
			   }
		   }
		   
		   //POST request was received but without a defined command in the first index.
		   else
		   {
			   console.log("Undefined request: \"" + body + "\" received");
			   replayString = "undefined request";
		   }
	   });
	   
	   request.on("end", 
		   function()
		   {
			   console.log("\n DATA END\n")
			   var post = qs.parse(body);
			   console.log(post);
		   }
		);
   }
   
   //Handle get requests
   else if(request.method == "GET")
   {
	    var body = "";
	    
	   
	    
	    body += request.url;
		
		//console.log(body);
		var command = body.toString();
	   
	   
	    //Handle a browser requesting the user list
		if(command === "/DOWNLOAD")
		{
		   replyString = "";
		   var keys = users.keys();
		   
		   if(keys.length > 0)
		   {
			   for(var i = 0; i < keys.length; i++)
			   {
				   var singleUserData = users.get(keys[i]);
				   replyString += keys[i] + "," + singleUserData[0] + "," + singleUserData[1] + "," + singleUserData[2] + ",";
			   }
			   
			   replyString = replyString.substring(0, replyString.length - 2);
			}
			
			else
			{
				replyString = "No users connected";
			}
		   
		   
		}
		
		else{
			console.log("PARSE FAILURE");
		}
   }

   
   response.writeHead(200, {'Content-Type': 'text/plain',
	'Access-Control-Allow-Origin': '*'});
   
   // Send the response body as "Hello World"
   response.end(replyString);
   
   //console.log(request);
}).listen(8081);

byteArrayToLong = function(byteArray) {
    var value = 0;
    for ( var i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256) + byteArray[i];
    }
}

//User object
function user(id)
{
	this.ID = id;
	this.sensors = new HashMap();
	this.implData = new HashMap();
}

//
function sensor(sensorName, dataList, implData)
{
	this.name = sensorName;
	this.data = dataList;
	
	//TODO: parse implementation string to map
	this.implementationData = 0;
}

//Set up the user's sensor map given a list of sensors that will be recieved.
//sensorlist is a string of the form SENSOR1:NUM_VALUES,SENSOR2:NUM_VALUES
user.prototype.setSensors = function(sensorList){
	//TODO: parse sensorList
	var individualSensors = sensorList.split(",");
	
	for(var i = 0; i < individualSensors.length; i++)
	{
		var pair = individualSensors[i].split(":");
		
		sensors.set(pair[0], new Array(parseInt(pair[1])));
	}
};

