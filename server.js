
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


// Importing the module 'express', store that into a function call variable
var express = require('express');  
var app = express();
var server = app.listen(3000); // node server.js  ,  localhost:3000

// Send the html, js files in public to the app
app.use(express.static('public')); 



// Importing the module 'socket.io'
/* This part is just the socket.io for the SERVER */

var socket = require('socket.io');
var io = socket(server);

/* Socket connection from Server to Client */
io.sockets.on('connection', newConnection);

function newConnection(socket) {
	
	// Connection
	console.log('Just connected to: ' + socket.id);
	
	
	// Receiving the mouse movement data from client
	// second argument is the function that does something with the data
	socket.on('mouseMove', mouse_Data);

	function mouse_Data(data) {
		console.log(data.x +  "," + data.y + "from" + socket.id);

		//We also must broadcast the data to all the other clients
		socket.broadcast.emit('mouseMove', data);

		// The one below also emits to the client itself
		// io.sockets.emit('mouseData', data);

	}





}



