var PORT = process.env.PORT || 8000;

/* ---------- Dependencies ---------- */
const express = require("express");
var http = require("http");
var socketIO = require('socket.io');
var mongodb = require('mongodb');

/*---------- Game Logic Dependencies ---------- */
const Game = require('./Classes/game');

/* ---------- Initialize ---------- */
const app = express();
var server = http.Server(app);
const io = socketIO(server);
var table = new Game();

app.set("port", PORT); // 8000 as default


/* ---------- Dynamic Pages  ---------- */
app.set('view engine', 'ejs');
app.use('/public', express.static(__dirname + "/public")); // this lets us know that all our public files are in that directory

app.get(['/', 'index.html'], (request, response) => {
	response.render(__dirname + '/views/index.ejs', {
		username: "pointless",
		userhand: [" Fake Text", " blah", "oogly", "merry", "christmas"], 
		promptCard: "pointless",
		playercount: 0
	});
});


/* ---------- Mongo Code ---------- */
// set mongo client - our mlab account
const mongoClient = mongodb.MongoClient;
const url = 'mongodb://teamemoji:emoji1234@ds163013.mlab.com:63013/cardsagainsthumanity';


/* ---------- Socket.IO Code ---------- */



io.on('connection', newConnection); 

function newConnection(socket) {
	// This function is for handling socket connections of the server and client
	console.log('Connection from: ' + socket.id)

	/* ---------- User Registration ---------- */
	socket.on("Register", function userData(user_data) {
		
		console.log('Received username:' + user_data.username + ' Received password:' + user_data.password);

		var result = "empty";

		// Connection and error handling
		mongoClient.connect(url, {
			useNewUrlParser: true
		}, function (err, db) {
			if (err) {
				console.log("Error connecting to Mongo: " + err);
			} else {
				console.log('Successfully connected to ' + url);
			}

			// access the collection 'users' to register the name
			const cohDB = db.db('cardsagainsthumanity');
			const userCollection = cohDB.collection('users');

			// see if the username already exists in the server:
			userCollection.find({
				username: user_data.username
			}).toArray((err, dbResult) => {
				if (err) {
					
					console.log('Database has some querying error');
					result = "Database Error. Please try again Later";

				} else if (dbResult.length) { // if the result is not empty 
					result = "Username already exists in the database";
					console.log(result);

				} else {
					// Create a new user
					console.log('No record found, this is a new user!');
					insertNewUser();
					result = "Created User!";
				}

				function insertNewUser() {
					// inserts a new user info into the database
					userdata = {
						'username': user_data.username,
						'password': user_data.password
					};
					userCollection.insertOne(userdata, (err, dbResp) => {
						if (err) {
							console.log('Error inserting the new user ' + err);
							result = "Database Error. Please try again Later"

						} else {
							console.log(dbResp.insertedCount + ' doc inserted!');
							result = "User created!";
						}
						db.close;
					})
				} // end of insertNewUser func

				socket.emit('Registration_Status', result); //this seems to work if socket.emit is inside the main mongo statement
				console.log("DEBUG: Inside Main Mongo Statement", result) // This will print the correct result. ie "user created!"
			});
		}); // end of mongoclient connection

		console.log("DEBUG: Outside Main Mongo Statement", result) // this will print "empty". research into promises

	}); //end of "Register a new User"



	/* ---------- User Login ----------*/
	socket.on("Login", function userData(user_data) {

		let query = {
			username: user_data.username,
			password: user_data.password
		}; 

		let result = {
			success: false,
			message: "empty message",
			username: "empty user"
		}; 
	
		// Connection and error handling
		mongoClient.connect(url, {
			useNewUrlParser: true
		}, function (err, db) {
			if (err) {
				console.log("Error connecting to Mongo: " + err);
			} else {
				console.log('Successfully connected to ' + url);
			}

			// access the collection 'users' to register the name
			const cohDB = db.db('cardsagainsthumanity'); // https://stackoverflow.com/questions/43779323/typeerror-db-collection-is-not-a-function
			const userCollection = cohDB.collection('users');

			// see if the username already exists in the server:
			userCollection.find(query).toArray((err, dbResult) => {
				if (err) {
					console.log('Database has some querying error');
					result = {success:false,message:"Database Error. Please try again Later", username: user_data.username};
				
				} else if (dbResult.length) { // Found matching username/password combo 
					console.log("Username and Password Matches!. User is authenticated");
					result = {success:true,message:"User login Sucess!",username: user_data.username};
					
					// Add new player to the table
					table.addPlayer(username = user_data.username, socket_id = socket.id);
					
				} else {
					// Username and and password does not match
					console.log("Invalid username or password");
					result = {success:false,message:"Invalid username or password", username: user_data.username};
				}
				
				socket.emit('Login_Status', result); 
			});
		}); // end of mongoclient connection			

		console.log('Receiving Login request ' + user_data.username + ' with password:' + user_data.password);
		console.log('Current Online Players:');
	});

	socket.on('disconnect', () => {
		
		// Handle disconnected players
		table.PlayersList.find( (element) => {
			if (element.socket_id === socket.id) {
				element.connect = false;
			}
		});

		console.log('Disconnection from: ' + socket.id, 'Current Online Players:', table.PlayersList);
	});
	
	/* ------------------- Custom Cards----------------------- */
	//Receives the array of new user cards from client and saves to a text file
	socket.on('newUserCards', function(newPlayerCards) {
		var fs = require('fs');
		var file = fs.createWriteStream('array.txt');
		file.on('error', function(err) { /* error handling !!!!!!!!!!!*/ });
		newPlayerCards.forEach(function(v) { file.write(v + '\n'); });
		file.end();
	});

	/* ---------- Game Start ---------- */

	socket.on('initGame', function (canStart) {
		if (canStart) {
			io.emit('game_start', true); // io.emit sends to ALL clients, socket.broadcast.emit sends to all but the sender
			table.initGame();

			console.log(table.PlayersList); 
			// Send player's hands to each socket
			for (let i = 0; i < table.PlayersList.length; i++) {
				let player = table.PlayersList[i];

				console.log("emitting to ", player.username, player.socket_id);
				io.to(player.socket_id).emit('updateHand', player.hand);
			}

			io.emit('updatePlayersInGame', table.PlayersList); 
		}

	});

	/* ---------- Board (cards) function ---------- */
	socket.on('cardPlayed', function broadcastCard(data) {
		// Receives card being played by player. 
		console.log('Received card at index:  ' + data.card_idx + ' from: ' + data.username);
		
		// Only allow players that haven't played a card yet to play
		if (!table.played.includes(data.username)) {	
			
			console.log("Successfully playing card from" + data.username + data.card_idx);
			table.played.push(data.username);
			table.cardPlayed(data.card_idx, data.username);
			
			io.emit('cardPlayed', data);
		};

		
	});


}; //end of newConnection socket function

//send list of online players to client ever second.
setInterval(() => {
    io.emit('Online_Players_List', table.onlinePlayersList);
}, 100);



/* ---------- Start Server Listening ---------- */
server.listen(app.get("port"), function () {
	console.log("Server started on port %s", app.get("port"));
});