var PORT = process.env.PORT || 8000;
var dev = false;
var skip2game = false;

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
const maxPlayers = 5;
var table = new Game();
var totalOnlinePlayers = {};   // {socket.id:username}

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

	socket.on('updateChatbox', (message, sender) => updateChatbox(socket, message, sender));

	socket.on('timerRanOutGetCurrentGameState', (username) => timerRanOutGetCurrentGameState(socket, username));
	
	// Debugging sockets below
	socket.on('skip2game', () => skipGame(socket) );
	if (skip2game) {
		socket.emit('createSkipButton');
	}
}); 

setInterval(() => {
	// Emit All online players, # players joined game 1
	io.emit('Online_Players_List', totalOnlinePlayers, table.getPlayerCount());
}, 1000);

/* ---------- Start Server Listening ---------- */
server.listen(app.get("port"), function () {
	console.log("Server started on port %s", app.get("port"));
});



/* *************** FUNCTIONS BELOW - these can be seperated to other files at a differnt time ****************** */

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
		if (table.isDisconnected() && table.isPartofGame(totalOnlinePlayers, socket.id)) {
			io.to(socket.id).emit('Disconnected_Player', table.allAddedCustomCards(), table.playerAddedCustomCard());
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
				if (table.isDisconnected() && table.isPartofGame(totalOnlinePlayers, socket.id)) {
					table.addDisconnectedPlayer(totalOnlinePlayers, socket.id);
					io.to(socket.id).emit('Disconnected_Player', table.allAddedCustomCards(), table.playerAddedCustomCard(totalOnlinePlayers[socket.id]));
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

	console.log('Receiving Login request. Username: ' + user_data.username + ' Password:' + user_data.password);
	console.log('Current Online Players:', Object.keys(totalOnlinePlayers).length);
};

function disconnect(socket) {
	/* Handle disconnected players, removing them from the onlinePlayers list */
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
	// Append new cards to file
	let username = totalOnlinePlayers[socket.id];
	if (table.isPlayerReadyCustomCards(username)) {
		for (var i = 0; i < newPlayerCards.length ; i++) {
			fs.appendFile('Classes/array.txt', newPlayerCards[i] + "\n", function (err) {
				if (err) throw err;
			});
		}
		console.log('Cards added!');
	} else {
		console.log('You are already ready and can\'t add more cards!');
	}

 	if (table.isTableReadyCustomCards()) {
		
		table.initGame();
		let message = "Game started!"
		table.PlayersList.forEach( (player) => _updateAll(socket, player, message));

	} else {
		console.log("Waiting for players!!!");
	}
};

function joinGameOne(socket) {
	// If players < maxPlayers and player not in game, add player
	if (table.getPlayerCount() < maxPlayers && !table.isPartofGame(totalOnlinePlayers, socket.id) && table.isGameOpen()) {
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
		if (!table.isGameOpen()) {
			let message = "Game is now closed. You cannot join midgame.";
			io.to(socket.id).emit('game_start', false, message);
		} else if (!table.isPartofGame(totalOnlinePlayers, socket.id)) {
			let message = "Game can hold " + maxPlayers + " players max";
			io.to(socket.id).emit('game_start', false, message);
		}
	}
};

function initGame(socket, canStart, skip=false) {
	// Skip flag is true when skip2game to allow skipping all of that
	if (skip) {
		// Skips the custom card thing, and straight up starts the game: - this is pulled from the newCards() function above
		let message = "Skipping straight to game!"
		table.PlayersList.forEach((player) => _updateAll(socket, player, message));
		return;
	}

	if (canStart && table.getPlayerCount() >= 2) {
			// Only players part of game can press start
			if (table.isPartofGame(totalOnlinePlayers, socket.id)) {
				for (let i = 0; i < table.getPlayerCount(); i++) { 
					
					let message = "Start adding your own cards!";
					let player = table.PlayersList[i];

					io.to(player.socket_id).emit('customCards', true, message);
				}
				table.gameClose();
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
	/* Allows a player in a game to reconnect */
	let message = "Player is continuing game.";
	let username = totalOnlinePlayers[socket.id];
	let player = table.getPlayer(username);
	_updateAll(socket, player, message);

	console.log(table.PlayersList);
};

function _updateAll(socket, player, message) {
	/* Updates Hand, Banner and Prompt
	Parameters: player (reference to Player object
	message: a string  */
	io.to(player.socket_id).emit('game_start', true, message, table.PlayerList, table.scores); 

	console.log(`Sending all updates: ${player.username}, ${player.socket_id}`);
	io.to(player.socket_id).emit('updateHandorJudge', player.hand, player.judge);
	io.to(player.socket_id).emit('updateBanner', table.PlayersList, table.scores, table.round);
	io.to(player.socket_id).emit('updatePrompt', table.promptCard.value);
}

function cardPlayed(socket, data, option) {
	/* Receives card being played by player from client.js sendCard() function 
	
	Parameters:

	* var data = {
		card_idx: card_idx // Index of the card played from client
		username: user.username, // Username of the person who played that card
		socket_id: user.socket_id // socket id for the client that played the card
	  }

	* option (string) can be either 'candidate' or 'winner'
		1) 'candidate' card is when a nonjudge player plays a card to be sent for judging
		2) 'winner' card is the card selected by the judge to win
	
	Emits: 
	If candidate card is played. The player answering it c
	If the winning card is played (that was selected by the judge), emit to everyone a winner of that round has been found

	*/

	console.log(`${data.username} is requesting to play a card at ${data.card_idx}`);
	
	if (option == 'candidate') { 

		/* If player has NOT YET PLAYED or and is NOT A JUDGE then:
		 * 1)  Send the card to the judge hand
		 * 2)  Emit to the client that they can't play another card, and highlight the card they've played
		 * 3)  Check if it's time to swap to 'judge' state by checking if every other player has played
		 	 If it is time to do judge then:
		 	 	* A) Swap to judgeState
		 	 	* B) Send to all clients to switch to judging state HTML
		*/
		if (!table.hasPlayed(data.username) && !table.isJudge(data.username)) {	
			
			console.log("Successfully accepted answer card from: " + data.username + " at card index:" + data.card_idx);
			
			// 1)
			table.cardPlayed(data.card_idx, data.username);
			
			// 2) Emission from server to tell client to highlight the card (in HTML) to signify disabled button
			// TODO: socket.emit('disableAnswers', data['card_idx']); // Disable the buttons

			// 3) Check if everyone else has played 
			console.log("Everyone played?", table.everyonePlayed());
			console.log("Current Gamestate is: ", table.getGameState());

			if (table.everyonePlayed() && (table.getGameState() === 'answer')) {
				console.log(`Everyone has played, emitting the judgehand for all to see: ${table.judgeHand}`);

				//A) Switch the gamestate into Judging time
				table.switchJudgeState();
				let judge = table.getJudgePlayer();

				// B) 
				io.emit('startJudgeRound', table.judgeHand, judge); // Swaps game mode to all clients that
				io.to(judge.socket_id).emit('showJudgeDisplay', table.judgeHand); // show Judge HTML to the judge
				
			} else {
				console.log(`Those who played: ${table.played.length}. Waiting for ${table.getPlayerCount()-1} total to play`);
			}
		} else { // Reject the card they are trying to answer with if they are a judge or they've already played
			console.log("Card rejected from: " + data.username + " " + data.card_idx);
			
			let reason;
			if (table.hasPlayed(data.username)) {
				reason = "already played";
			} else if (table.isJudge(data.username)) {
				reason = "is a judge"
			}
			console.log(`Rejected because ${data.username} ${reason}.`);
		}
		
	} else if (option == 'winner') { // when judge is deciding whih card is the winner
		
		/* This option occurs when the client, who is the current judge, sends the winning card to the server
		 * 1) obtain the owner of the card
		 * 2) Combine the prompt with the winning answer to produce the full sentence
		 * 3) Get the Player object of the current judge
		 * 4) end the round -> updating the scores of the winner, promoting the next judge, drawing new prompt
		 * 5) Emitting to all players end judge round:
		 		
		 		old_judge : Player object of old judge
		 		new_judge : Player object of next judge 
		 		new_prompt : next prompt
		 		table.PlayersList : Array of Player objects of players in the game
		 		table.scores : newly updated hashmap of each players scores
		 		
		 		winner : JSON object { username (string), completed_text (string)} of the winning card and winning full sentence
		*/


		console.log( ' *** Winner has been selected! ***');

		// 1) Find out who is the winner from the index of the card
		let idx = data['card_idx'];
		let winning_user = table.judgeHand[idx].owner; // Gets the owner of the card
		console.log(`* index of winning card is ${idx}, card is ${table.judgeHand[idx]}, owner is ${winning_user} `);

		// 2 Combines the prompt and winning answer to produce the full sentence
		let completed_text = table.buildSentence(idx); 

		let winner = {
			user: winning_user, // winning_user is the username (string)
			completed_text: completed_text // string
		};

		// 3) Obtain the current judge 
		let old_judge = table.getJudgePlayer();
		
		// 4) New judge, score update, new prompt, and switch to Answer State
		table.switchAnswerState(winning_user);
		
		let new_judge = table.getJudgePlayer();
		let new_prompt = table.promptCard.value;
		let scores = table.scores;

		if (table.hasWinner()) {
			console.log("Winner has been found! ");
			ResetGameButtonPressed(socket);
			// VictoryScreen(table.winner); //TODO: VictoryScreen will emit a victory screen to all clients, pass in the name of the winner or popup.
		} else { // no winner yet
			io.emit('endJudgeRound', old_judge , new_judge, new_prompt, table.PlayersList, table.scores, winner, table.round);
		}
	
	} else {
		throw option + ' is an invalid option. Must be either "winner" or "candidate" '; 
	}

}

function ResetGameButtonPressed(socket) {

	let user = totalOnlinePlayers[socket.id];
	console.log('Resetting Game 1. Request sent by user:',user,'(',socket.id,')');

 	let playerList = table.PlayersList;

 	table.PlayersList.forEach( (player) => io.to(player.socket_id).emit('reset_current_game',user));
 	//create a brand new table object to replace the old table
	table = new Game();
 };

 function timerRanOutGetCurrentGameState(socket, username) {

	//console.log(username," Player Timed out")

	let playerIsJudge = table.isJudge(username);
	let judgeMode = (table.getGameState() === "judge");
	let answerMode = (table.getGameState() === "answer");
	let playerHand = table.getPlayer(username).hand;
	let judgeHand = table.judgeHand;

	//console.log("---GameState: ",playerIsJudge,judgeMode,answerMode,playerHand,judgeHand);

	io.to(socket.id).emit('timerRanOut_AutoPick',playerIsJudge,judgeMode,answerMode,playerHand,judgeHand);

 }

 function updateChatbox(socket, message, username) {
 	/* Receives message and username from client and displays into the chatbox */
 	console.log(`Received message: ${message} from user ${username}`);
 	io.emit('updateChatbox', message, username);
 }

 /* --------------------- Developer Mode ------------------------- */

if (skip2game) {
	console.log("DEVMODE: Skipping to GAME MODE Directly. ")
};

function skipGame(socket) {
	// called by socket above
	console.log("Skip2Game pressed... producing all");
	let keys = Object.keys(totalOnlinePlayers); // The key is the socket.id, the value is the username
	let PlayersList = keys.map( (key) => table.addPlayer(totalOnlinePlayers[key], key) );   
	table.connectedPlayers += PlayersList.length; 

	console.log("DEVMODE: Here are the current Players", table.PlayersList);
	table.initGame(); // initGame on the server Game object
	initGame(socket, true, true); // initGame to the clients
}
