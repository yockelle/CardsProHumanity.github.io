var PORT = process.env.PORT || 8000;
var dev = true;

/* ---------- Dependencies ---------- */
const express = require("express");
const http = require("http");
const socketIO = require('socket.io');
const mongodb = require('mongodb');
const fs = require('fs'); 

/*---------- Game Logic Dependencies ---------- */
const Game = require('./Classes/game');

/* ---------- Initialize ---------- */
const app = express();
var server = http.Server(app);
const io = socketIO(server);
var table = new Game();
var totalOnlinePlayers = {};   // {socket.id:username}
var tableOneConnectStatus = 0; // arbitrary counter for number of users connected to game 1

app.set("port", PORT); // 8000 as default

/* ---------- HTML PAGE  ---------- */
app.use('/public', express.static(__dirname + "/public"));
app.use(express.static("public"));

/* ---------- Mongo Code ---------- */
const mongoClient = mongodb.MongoClient;
const url = 'mongodb://teamemoji:emoji1234@ds163013.mlab.com:63013/cardsagainsthumanity';


/* ---------- Socket.IO Code ---------- */
io.on('connection', function newConnection(socket) {

	console.log('Connection from: ' + socket.id)

	socket.on("Register", (user_data) => registerUser(socket, user_data));
	socket.on("Login", (user_data) => loginUser(socket, user_data));
	socket.on("disconnect", () => disconnect(socket));

	socket.on("newUserCards", (newPlayerCards) => newUserCards(socket, newPlayerCards));

	socket.on('joinGameOne', () => joinGameOne(socket));
	socket.on('initGame', (canStart) => initGame(socket, canStart));
	socket.on('continueGame', () => continueGame(socket));


	socket.on('cardPlayed', (data, option) => cardPlayed(socket, data, option)); // Player sends their choice cards 
	socket.on('ResetGameButtonPressed', () => ResetGameButtonPressed(socket));

}); 

setInterval(() => {
	// Emit All online players, # players joined game 1
	io.emit('Online_Players_List', totalOnlinePlayers, table.getPlayerCount());
}, 1000);

/* ---------- Start Server Listening ---------- */
server.listen(app.get("port"), function () {
	console.log("Server started on port %s", app.get("port"));
});

/* *************** FUNCTIONS BELOW ****************** */

function registerUser(socket, user_data) {	
	
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
};

function loginUser(socket, user_data) {
	
	let query = {
		username: user_data.username,
		password: user_data.password
	}; 

	let result = {
		success: false,
		message: "empty message",
		username: "empty user"
	}; 

	// Developer mode to bypass mongoDB
	if (dev) {
		result.success = true;
		result.message = "Entering as Admin";
		result.username = user_data.username;

		totalOnlinePlayers[socket.id] = user_data.username;
		console.log("Total Players Online: " + Object.keys(totalOnlinePlayers).length);
		if (tableOneConnectStatus != table.getPlayerCount() && table.isPartofGame(totalOnlinePlayers, socket.id)) {
			io.to(socket.id).emit('Disconnected_Player');
			table.addDisconnectedPlayer(totalOnlinePlayers, socket.id);
		}

		socket.emit('Login_Status', result);
		return; // 'break' the function 
	}



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
			}
			// Found matching username/password combo 
			else if (dbResult.length) {
				console.log("Username and Password Matches!. User is authenticated");
				result = {success:true,message:"User login Sucess!",username: user_data.username};
				totalOnlinePlayers[socket.id] = user_data.username;
				console.log("Total Players Online: " + Object.keys(totalOnlinePlayers).length);

				// If #connected != #player objects in game1 and player username is part of game, reconnect player
				if (table.connectedPlayers != table.getPlayerCount() && table.isPartofGame(totalOnlinePlayers, socket.id)) {
					io.to(socket.id).emit('Disconnected_Player');
					table.addDisconnectedPlayer(totalOnlinePlayers, socket.id);
				}
			}
			// Username and and password does not match
			else {
				console.log("Invalid username or password");
				result = {success:false,message:"Invalid username or password", username: user_data.username};
			}
			
			socket.emit('Login_Status', result); 
		});
	}); // end of mongoclient connection			

	console.log('Receiving Login request ' + user_data.username + ' with password:' + user_data.password);
	console.log('Current Online Players:');
};

function disconnect(socket) {

	table.PlayersList.find( (element) => {
		if (element.socket_id === socket.id) {
			element.connect = false;
			table.connectedPlayers -= 1;
			console.log("Game 1 has " + table.connectedPlayers + " connected players.")
		}
	});

	delete totalOnlinePlayers[socket.id];
	console.log('Disconnection from: ' + socket.id, 'Current Online Players:', table.PlayersList);
};

function newUserCards(socket, newPlayerCards) {
	
	var file = fs.createWriteStream(__dirname + 'Classes/array.txt');
	file.on('error', function(err) { /* error handling !!!!!!!!!!!*/ });
	newPlayerCards.forEach(function(v) { file.write(v + '\n'); });
	file.end();

	if (!(table.numPlayersReady.includes(socket.id))) {
			table.numPlayersReady.push(socket.id);
	}

 	if (table.numPlayersReady.length == table.getPlayerCount()) {
		
		table.initGame();
		// Send player's hands to each socket
		for (let i = 0; i < table.getPlayerCount(); i++) {
			
			let message = "Game started!";
			let player = table.PlayersList[i];
		
			io.to(player.socket_id).emit('game_start', true, message); 

			console.log("emitting to ", player.username, player.socket_id);
			io.to(player.socket_id).emit('updateHand', player.hand);
			io.to(player.socket_id).emit('updatePlayerScores', table.PlayersList, table.scores);
		}
		// Send prompt to everyone
		console.log('sending the prompt card' + table.promptCard.value);
		io.emit('updatePrompt', table.promptCard.value);
		console.log(table.PlayersList);	
	} else {
		console.log("Waiting for players!!!");
	}
};

function joinGameOne(socket) {
	// If players < 2 and player not in game, add player
	if (table.getPlayerCount() < 2 && !table.isPartofGame(totalOnlinePlayers, socket.id)) {
		console.log("Adding new player!");
		table.addPlayer(username = totalOnlinePlayers[socket.id], socket_id = socket.id);
		table.connectedPlayers += 1;
		console.log("Game 1 has " + table.connectedPlayers + " connected players.")
	} 
	// If player is already part of game
	else if (table.isPartofGame(totalOnlinePlayers, socket.id)) {
		console.log("Player is already part of game.");
	}
	// Show game is full only to person not in game
	else {
		if (!table.isPartofGame(totalOnlinePlayers, socket.id)) {
			console.log("Game is full.");
			let message = "Game is full.";
			io.to(socket.id).emit('game_start', false, message);
		}
	}
};

function initGame(socket, canStart) {
	if (canStart && table.getPlayerCount() >= 2) {
			// Only players part of game can press start
			if (table.isPartofGame(totalOnlinePlayers, socket.id)) {

				for (let i = 0; i < table.getPlayerCount(); i++) {
					
					let message = "Start adding your own cards!";
					let player = table.PlayersList[i];

					io.to(player.socket_id).emit('customCards', true, message);
				}
			} else {
				let message = "You cannot start a game you are not part of!";
				io.to(socket.id).emit('game_start', false, message);
			}
		} else {
			let message = "Game 1 needs at least 2 or more players!";
			io.to(socket.id).emit('game_start', false, message);
		}
};

function continueGame(socket) {
	let message = "Player is continuing game.";

	for (let i = 0; i < table.getPlayerCount(); i++) {
		let player = table.PlayersList[i];
		if (totalOnlinePlayers[socket.id] == player.username) {
			io.to(player.socket_id).emit('game_start', true, message); // io.to(player.socket_id).emit to all players in game using for loop

			console.log("emitting to ", player.username, player.socket_id);
			io.to(player.socket_id).emit('updateHand', player.hand);
			io.to(player.socket_id).emit('updatePlayerScores', table.PlayersList, table.scores);
			break;
		}
	}
	console.log(table.PlayersList);
};

function cardPlayed(socket, data, option) {
	// Receives card being played by player from client.js sendCard() function 
	
	/* 
	var data = {
		card_idx: card_idx // Index of the card played from client
		username: user.username, // Username of the person who played that card
		socket_id: user.socket_id // socket id for the client that played the card
	}

	option (a string) can be either 'candidate' or 'winner'
	'candidate' card is when a nonjudge player plays a card to be sent for judging
	'winner' card is the card selected by the judge to win

	*/

	console.log('Received card at index:  ' + data.card_idx + ' from: ' + data.username);
	
	if (option == 'candidate') { 

		// If player has not played yet or is a Judge 
		if (!table.played.includes(data.username) && !table.isJudge(data.username)) {	
			
			console.log("Successfully playing card from: " + data.username + " " + data.card_idx);
			table.played.push(data.username);
			table.cardPlayed(data.card_idx, data.username);
			
			io.emit('cardPlayed', data);

			// If everyone has played a card, it's time for the judge to judge
			let everyoneHasPlayed = (table.played.length === table.getPlayerCount() - 1);
			console.log("has everyone played: " + everyoneHasPlayed, table.played.length, table.getPlayerCount());

			if (everyoneHasPlayed) {
				console.log(" Everyone has played, emitting the judgehand for all to see: " 
					+ table.judgeHand);

				// Begin Judgeround
				let judge = table.getJudgePlayer();

				io.to(judge.socket_id).emit('showJudgeDisplay', table.judgeHand);
				io.emit('startJudgeRound', table.judgeHand, judge);
			} 
		} else {
			console.log("Card rejected from: " + data.username + " " + data.card_idx);
		}
		
	} else if (option == 'winner') {
		
		console.log( 'Winner has been selected');

		// Find out who is the winner from the index of the card
		let idx = data['card_idx'];

		let winning_user = table.judgeHand[idx].owner; // Gets the owner of the card

		console.log(`index of winning card is ${idx}, card is ${table.judgeHand[idx]}, owner is ${winning_user} `);

		let old_judge = table.getJudgePlayer();
		// New judge, score update, new prompt,
		table.endRound(winning_user);
		let new_judge = table.getJudgePlayer();
		
		let new_prompt = table.promptCard;
		let scores = table.scores;

		io.emit('endJudgeRound', old_judge , new_judge, new_prompt, table.PlayersList, table.scores);
	} else {
		throw option + ' is an invalid option. Must be either "winner" or "candidate" '; 
	}

};

function ResetGameButtonPressed(socket) {

	let user = totalOnlinePlayers[socket.id];
	console.log('Resetting Game 1. Request sent by user:',user,'(',socket.id,')');
 	let playerList = table.PlayersList;
 	//For each player in the table, emit a message to tell client to reset game
	for (let i = 0; i < playerList.length; i ++) {
		let player = playerList[i];
		io.to(player.socket_id).emit('reset_current_game',user);
	}
 	//create a brand new table object to replace the old table
	table = new Game();
 };
