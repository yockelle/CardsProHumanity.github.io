
var PORT = process.env.PORT || 8000 ;

// Dependencies 
var express = require("express");
var http = require("http");
var socketIO = require('socket.io');

// Initialize 
var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set("port", PORT); // 8000 as default
app.use('/public', express.static(__dirname + "/public"));

// Routing

/*  Don't need this if we are serving staticly, see below
app.get('/', function(request, response) {
	response.render('index.html');
});
*/

// since we serve static pages, we won't need to handle requests
app.use(express.static("public"));

// connection coming from client
io.on('connection', newConnection); // io.socket.on('connection') also works for some reason

function newConnection(socket) {

	console.log('Connection from: ' + socket.id)

	// Receiving data from client
	socket.on('mouseMove', mouse_Data);

	function mouse_Data(data) {
		console.log(data.x +  "," + data.y + "from" + socket.id);
		socket.broadcast.emit('mouseMove', data);
	}

}

console.log(app.get("port"))


server.listen(app.get("port"), function() {
	console.log("Node app started on port %s", app.get("port"));
});

