var http = require("http");
var qs = require("querystring")
var HashMap = require('hashmap')

var users = new HashMap();

var baudRate = 1/1;

http.createServer(function (request, response) 
{
   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   
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
		   
		   command = command.split(",");
		   //console.log(command[0])
		   if(command[0] === "CONNECT")
		   {
			   console.log("Connection attempt from: \"" + command[0] + "\"");
			   
			   
			   if(command[1] !== "")
			   {
				   users.set(command[1], [0, 0, 0, 0, 0, 0]);
				   
				   console.log("User: \"" + command[1] + "\" connected");
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
				   
				   x += xVel * baudRate + (xAccel * Math.pow(baudRate, 2));
				   y += yVel * baudRate + (yAccel * Math.pow(baudRate, 2));
				   z += zVel * baudRate + (yAccel * Math.pow(baudRate, 2));
				   
				   xVel += xAccel * baudRate;
				   yVel += yAccel * baudRate;
				   zVel += zAccel * baudRate;
				   
				   var newCoords = [x, y, z, xVel, yVel, zVel];
				   users.set(command[1], newCoords);
				   console.log("User \"" + ID + "\" Updated to\t x: " + x + " y: " + y + " z: " + z + "\n xVel: " + xVel + " yVel: " + yVel + " zVel: " + zVel + " \nxAccel: " + xAccel + " yAccel: " + yAccel + " zAccel " + zAccel + "\n=================================================\n");
			   }
			   
			   else{
				   console.log("User \"" + command[1] + "\" not found!");
			   }
			   

		   }
		   
		   else
		   {
			   console.log("Undefined request: \"" + body + "\" received");
		   }
		   
		   
		   
		  /* for(var i = 0; i < 4; i++)
		   {
			  // console.log(data[i]);
			   
			   var newFloat = 0;
			   var byteArray = new Array(16);
			   for(var j = 0; j < 8; j++)
			   {
				   var a = data[(8* i) + j];
				   byteArray[j] = a;
				   console.log(byteArray[j]);

			   }
			   //console.log('float' + i)
			   //newFloat = byteArrayToLong(byteArray);
			   //console.log(newFloat +'\n');
		   }*/
	   })
	   
	   request.on("end", 
		   function()
		   {
			   console.log("\n DATA END\n")
			   var post = qs.parse(body);
			   console.log(post);
		   }
		)
   }
   
   
   response.writeHead(200, {'Content-Type': 'text/plain'});
   
   // Send the response body as "Hello World"
   response.end('Hey fag\n');
   
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

