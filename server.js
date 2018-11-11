
var PORT = process.env.PORT || 8000 ;

// Dependencies 
const express = require("express");
var http = require("http");
var socketIO = require('socket.io');

// Initialize 
const app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set("port", PORT); // 8000 as default

/* ---------------- Static  Page ----------------- We won't be using this anymore
// Looks in /public/index.html for static serving
app.use('/public', express.static(__dirname + "/public"));
app.use(express.static("public"));
*/

/* ----------------- Dynamic Pages  ------------------ */
// EJS for 'templating' - dynamic web server . Looks in /views/index.ejs
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + "/public")); // this lets us know that all our public files are in that directory



// Routing
app.get(['/','index.html'], function(request, response) {
													// The argument below will be replaced with JSON from the database
	response.render(__dirname + '/views/index.ejs', { username : 'Joe_Schmoe', userhand: ['[cardid:0]','[cardid:1]','[cardid:2]','[cardid:3]'] });
});


/* --- TODO: css and js  stuff (FRONTEND stuff)  ----------
app.get('/css/main.css', function(request, response) {
	response.sendFile( (__dirname + '/public/css/main.css'));
}); 

app.get('/js/main.js', function(request, response) {
	response.sendFile( (__dirname + '/public/js/main.js'));
});
*/ 


// connection coming from client
io.on('connection', newConnection); // io.socket.on('connection') also works for some reason

function newConnection(socket) {

	console.log('Connection from: ' + socket.id)


	// Receiving mouse click from client 

	socket.on('cardPlayed', function broadcastCard(data) {
		// This function broadcasts the card to everyone 

		console.log('broadcasting card to everyone else. recived from: ' + data.username);
		socket.emit('cardPlayed', data);
		// Note: socket.broadcast.emit('cardPlayed', data) can also be used to broadcast to all except self
	})

}




// Start Server Listening

server.listen(app.get("port"), function() {
	console.log("Server started on port %s", app.get("port"));
});

