
/* 

 * This is the code file for the web server 
 that we will use for cards against humanity

 * This server will host the html and the JS files 
 and maybe Python script to process stuff
 
	** Dependencies installed ** 
 * 1) Framework: Express (b/c really easy to use)
   Instead of writing from scratch, we're just going to use
   an existing framework - called Express 
 * 2) Framework: Socket.io  
   This is just tacking care of input and output from server and client

 * the directory: node_modules
  has these dependencies:
  1) npm install express --save
  2) npm install socket.io --save

 
*/

// Express server




var express = require('express');  
var app = express();
app.set("port", (process.env.PORT || 8000));
app.use(express.static('public')); // Statically serve pages from the 'public' directory

var http = require("http").Server(app);
http.listen(app.get("port") , function() {
	console.log("Server started on port %s", app.get("port"));
});


// Socket io 
var socket = require('socket.io');
var io = socket(http); 



/* Socket connection from Server to Client */
io.sockets.on('connection', newConnection);

function newConnection(socket) {
	
	// Connection
	console.log('Just connected to: ' + socket.id);
	
	
	// Receiving the mouse movement data from client
	socket.on('mouseMove', mouse_Data);

	function mouse_Data(data) {
		console.log(data.x +  "," + data.y + "from" + socket.id);
		socket.broadcast.emit('mouseMove', data);

		// io.sockets.emit('mouseData', data); // emits to client itself

	}

	// Receiving click

	socket.on('clickedCard', function(data) {
		console.log(socket.id + " has clicked at " + data.x + "," + data.y);
	})







}



