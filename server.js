
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
	response.render(__dirname + '/views/index.ejs', { username : AllPlayers.DEDFAEX.username, 
													  userhand: AllPlayers.DEDFAEX.gameSession[1].userhand,
													  promptCard: AllPlayers.DEDFAEX.gameSession[1].promptCard});
});


/* --- TODO: css and js  stuff (FRONTEND stuff)  ----------
app.get('/css/main.css', function(request, response) {
	response.sendFile( (__dirname + '/public/css/main.css'));
}); 

app.get('/js/main.js', function(request, response) {
	response.sendFile( (__dirname + '/public/js/main.js'));
});
*/ 

/* Setting up variables (Idealy this should be in MongoDB)*/
//this stores all the promptCards
let promptCards = { 0: {cardid: 0,
						cardValue: 'Daddy why is mommy crying?'}, 
					1: {cardid: 1,
						cardValue: 'What does Dick Cheney prefer?'},
					2: {cardid: 2,
						cardValue: 'I drink to forget __'},
					};


/* Setting up variables (Idealy this should be in MongoDB)*/
//this stores all the playerCards
let Cards = { 0: {cardid: 0,
					cardValue: 'Drinking alone'}, 
			  1: {cardid: 1,
					cardValue: 'The glass ceiling,'},
			  2: {cardid: 2,
					cardValue: 'Sample2'},
			 };

/* Setting up variables (Idealy this should be in MongoDB)*/
//this stores all the player/game info
let AllPlayers = {DEDFAEX : {
					username: 'Joe_Schmoe',
					password: "abc",
					unquieID: "DEDFAEX",
					gameSession: {
						1 : {
							numberOfCards : 3,
							userhand: [Cards[0] , Cards[1] , Cards[2]],
							promptCard: promptCards[0],
						}
					},
				},

				EFADFEDA : {
					username: 'Sam_Smith',
					password: "abc",
					unquieID: "EFADFEDA",
					gameSession: {
						1 : {
							numberOfCards : 2,
							userhand: [Cards[0] , Cards[2]],
							promptCard: promptCards[0],
						}
					},
				}

				}



// connection coming from client
io.on('connection', newConnection); // io.socket.on('connection') also works for some reason

function newConnection(socket) {

	console.log('Connection from: ' + socket.id)

	socket.on('cardPlayed', function broadcastCard(data) {
		// This function broadcasts the card to everyone 

		console.log('Received' + data.cardid + ' from: ' + data.username);
		socket.broadcast.emit('cardPlayed', data);
		// Note: socket.broadcast.emit('cardPlayed', data) 
	})

	socket.on("AskInput", function userData(user_data) {
		console.log('Received username:' + user_data.username + ' Received password:' + user_data.password)
	})
}




// Start Server Listening

server.listen(app.get("port"), function() {
	console.log("Server started on port %s", app.get("port"));
});

