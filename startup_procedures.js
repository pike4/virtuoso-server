var os = require('os');
var sensorString = "";

/*
Sensor lists. Each of these arrays represents a list of options that can implement a requirement on the server. Each string represents an optional selection of sensors that can fulfill this role. In order to implement a sensor suite, all items listed in a single item from the list must be available. The preference for the different options in the list is in the order listed. For example: 

var suite1 = ["Accelerometer,Thermometer","Camera,Gyroscope,Microphone"];

requires either an accelerometer and a thermometer or a camera, gyroscope, and microphone. The preferred set of sensors will be the accelerometer and thermometer, but if those aren't available, the camera, gyroscope, and microphone will suffice.

*/

//examples
var acceleration_sensors = ["Linear_Acceleration", "Accelerometer&&Gyroscope"];
var environmental_sensors = ["Ambient_Light&&Microphone","Camera"];
var other_sensors = ["Accelerometer"];

/*
Required and optional sensor suites. All sensor suites in requiredSensors must be available on the given device to connect as a controller. All suites from optionalSensors will be sent along with the rest of the data as available, but are not explicitly required to participate.
*/

//examples
var requiredSensors = [acceleration_sensors, environmental_sensors];
var optionalSensors = [other_sensors];
var allSensors = [requiredSensors, optionalSensors];

module.exports = {	
	defineSensorString : function()
	{
		for(var k = 0; k < allSensors.length; k++)
		{
			var curList = allSensors[k];
			for(var i = 0; i < curList.length; i++)
			{
				for(var j = 0; j < curList[i].length; j++)
				{
					sensorString += curList[i][j];
					
					//Delimit each sensor suite option with a double bar. Don't put a delimiter after the last one.
					if(j != curList[i].length - 1)
					{
						sensorString += "||";
					}	
				}
				
				//Delimit each required sensor suite with a comma. Don't put a delimiter after the last one.
				if(i != curList[i].length - 1)
				{
					sensorString += ",";
				}
			}
			
			//Delimit the required sensors from the optional and any other subsets that users choose to define with a slash. Don't put a delimiter after the last one.
			if(k != allSensors.length - 1)
			{
				sensorString += "/";
			}
		}	
		return sensorString;
	},
	
	getAddress : function()
	{
		var ifaces = os.networkInterfaces();
		var addresses = [];
		for (var k in ifaces) 
		{
			for (var k2 in ifaces[k]) 
			{
				var address = ifaces[k][k2];
				if (address.family === 'IPv4' && !address.internal) 
				{
					addresses.push(address.address);
				}
			}
		}
		
		return addresses[0];
	}
}