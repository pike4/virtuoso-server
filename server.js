var http = require("http");
var qs = require("querystring")
var HashMap = require('hashmap')

var users = new HashMap();

var baudRate = 1/10;

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
		   console.log("COMMAND" + command);
		   command = command.split(",");
		   //console.log(command[0])
		   if(command[0] === "CONNECT")
		   {
			   console.log("Connection attempt from: \"" + command[0] + "\"");
			   
			   
			   if(command[1] !== "")
			   {
				   users.set(command[1], [0, 0, 0, 0, 0, 0]);
				   
				   console.log("User: \"" + command[1] + "\" connected");
				   replyString = "connection successful";
			   }
			   
			   else
			   {
					replyString = "connection failed";
			   }
			   
		   }
		   
		   else if(command[0] === "UPLOAD")
		   {
			   var ID = command[1];
			   var xAccel = parseFloat(command[2]);
			   var yAccel = parseFloat(command[3]);
			   var zAccel = parseFloat(command[4]);
			   
			   if(users.has(command[1]))
			   {
				   console.log("Update user: \"" + command[1] + "\"");
				   
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
				   console.log("User \"" + ID + "\" Updated to\t x: " + x + " y: " + y + " z: " + z + "\n xVel: " + xVel + " yVel: " + yVel + " zVel: " + zVel + " \nxAccel: " + xAccel + " yAccel: " + yAccel + " zAccel " + zAccel + "\n=================================================\n");
			   }
			   
			   else{
				   console.log("User \"" + command[1] + "\" not found!");
				   replyString = "user not found";
			   }
		   }
		   
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
   
   else if(request.method == "GET")
   {
	    var body = "";
	    
	   
	    
	    body += request.url;
		
		//console.log(body);
		var command = body.toString();
	   
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

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');

