
var PORT = process.env.PORT || 8000 ;

/*------------------ Dependencies -----------------*/
const express = require("express");
var http = require("http");
var socketIO = require('socket.io');
var mongodb = require('mongodb');

/* ----------------- Initialize ------------------ */
const app = express();
var server = http.Server(app);
const io = socketIO(server);

app.set("port", PORT); // 8000 as default

/* ----------------- Dynamic Pages  --------------- */
app.set('view engine', 'ejs'); 
app.use('/public', express.static(__dirname + "/public")); // this lets us know that all our public files are in that directory

// Routing
app.get(['/','index.html'], function(request, response) {
													// The argument below will be replaced with JSON from the database
	response.render(__dirname + '/views/index.ejs', { username : AllPlayers.DEDFAEX.username, 
													  userhand: AllPlayers.DEDFAEX.gameSession[1].userhand,
													  promptCard: AllPlayers.DEDFAEX.gameSession[1].promptCard});
});



/* ----------------------- Mongo Code --------------------------------------- */
// set mongo client - our mlab account
const mongoClient = mongodb.MongoClient;
const url = 'mongodb://teamemoji:emoji1234@ds163013.mlab.com:63013/cardsagainsthumanity';


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

/* ------------------- Socket.IO Code ----------------------- */ 
io.on('connection', newConnection); // io.socket.on('connection') also works for some reason

function newConnection(socket) {
	// This function is for handling socket connections of the server and client
	console.log('Connection from: ' + socket.id)

	/* ---- Broadcast Card ---- */
	socket.on('cardPlayed', function broadcastCard(data) {
		// This function broadcasts the card to everyone 
		console.log('Received' + data.cardid + ' from: ' + data.username);
		socket.broadcast.emit('cardPlayed', data);

	});

	/* ---- Register a new User ---- */
	socket.on("Register", function userData(user_data) {
		console.log('Received username:' + user_data.username + ' Received password:' + user_data.password);

		var result = "empty";

		// Connection and error handling
		mongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
			if (err) {
				console.log("Error connecting to Mongo: " + err);
			} else {
				console.log('Successfully connected to ' + url);
			}
		
			// access the collection 'users' to register the name
			const cohDB = db.db('cardsagainsthumanity'); // https://stackoverflow.com/questions/43779323/typeerror-db-collection-is-not-a-function
			const userCollection = cohDB.collection('users');

			// see if the username already exists in the server:
			userCollection.find({username: user_data.username}).toArray((err,dbResult) => {
				if (err) {
					console.log('Database has some querying error');
					result =  "Database Error. Please try again Later";
				} else if (dbResult.length) { // if the result is not empty 
					console.log('Username already exists in the database');
					result = "Username already exists in the database";
					
				} else {
					// Create a new user
					console.log('No record found, this is a new user!');
					insertNewUser();
					result = "User created!";
				}

			function insertNewUser() {
				// inserts a new user info into the database
				userdata = {'username' : user_data.username, 'password' : user_data.password};
				userCollection.insertOne(userdata, (err, dbResp) => {
					if (err) {
						console.log('Error inserting the new user ' + err);
						result =  "Database Error. Please try again Later"
					} else {
						console.log(dbResp.insertedCount + ' doc inserted!');
						result = "User created!";
		
					}
					db.close;
				}) 
			}// end of insertNewUser func

			socket.broadcast.emit('Registration_Status', result);
			});
		});// end of mongoclient connection

		
	}); //end of "Register a new User"


	/* ---- TODO: Validate a login ---- */
	socket.on("Login", function userData(user_data) {
			console.log('Receiving Login request ' + user_data.username + 'with password:' + user_data.password);
	});

	socket.on('disconnect', () => {
		console.log('Disconnection from: ' + socket.id);
	})

}; //end of socket





// Start Server Listening

server.listen(app.get("port"), function() {
	console.log("Server started on port %s", app.get("port"));
});

