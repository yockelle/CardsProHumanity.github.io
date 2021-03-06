const Player = require('./Player');
const Deck = require('./Deck');
const fs = require('fs'); 

module.exports = class Game {

	constructor() { 
		
		// Pre-Game Connection and Card Customization information
		this.connectedPlayers = 0; // Counts the number of players actively connected to game
		this.numPlayersReady = []; // Array storing the usernames of those who have pressed 'Ready' for custom card
		this.gameOpen = true; // Boolean stating whether game is open or closed to join, preventing users from joining midgame

		// Player & Scoring information
		this.PlayersList = []; // List of Player objects. { username, socket_id, hand, judge, connection}
		this.scores = {};
		this.played = new Set();

		// Board: Decks and prompt
		this.PlayerDeck = new Deck('Player'); 
		this.PromptDeck = new Deck('Prompt'); 
		this.promptCard; // Single Card object - current card prompt
		
		// Judge's information
		this.judgeHand = []; // Array of Cards objects - for the Judge to select
		this.judgeidx = 0; // index of the current judge

		// Game Status
		this.winner = null; // Holds the winning player's name
		this.gameState = 'answer'; // Toggles  between: 'answer' and 'judge' (to indicate the two rounds)
		this.round = 1;

		// Create new custom cards file
		fs.open('Classes/array.txt', 'w', function (err, file) {
			if (err) throw err;
			console.log('Classes/array.txt was created for custom cards');
		});
	}

	/* --------------------------------------  Getters , setters ----------------------------------*/
	getPlayerCount() {
		/* Returns the count of current players in the game */
		return this.PlayersList.length;
	}

	getJudgePlayer() {
		/* Returns the Player object of the current judge */
		return this.PlayersList[this.judgeidx];
	}

	getPlayer(username) {
		/* Returns the Player object from the username passed in

		Parameters:
		username (string) username of player you are searching for

		Return
		The player object of the player if found, else throws an exception

		*/
		for (let i = 0; i < this.getPlayerCount(); i++) {
			if (username == this.PlayersList[i].username) {
				return this.PlayersList[i];
			}
		}
		throw username + " is not a current user in the game! ";
	}

	getGameState() {
		/* Gets the current game state (a string)
		   
		   Two states possible:
		 * 'answer' // answer phase is when players answer the prompt
		 * 'judge'  // judge phase is when judge decides
		*/
		return this.gameState;
	}

	gameClose() {
		/*
			Changes the boolean gameOpen to false
		*/
		this.gameOpen = false;
	}

	/* ---------------------------------------- Boolean Methods -------------------------------------*/
	isPartofGame(totalOnlinePlayers, socket_id) {
		/* Function to check if a player (socket_id) is part of the game --> boolean

		Parameters: 
		totalOnlinePlayers (array of objects: {socket.id:username} (globally defined in server.js)
		socket_id (string) socket.id of the query

		Returns
		Boolean : whether not the player's socketid is found in the player

		*/

		let isFound = false;
		for (let i = 0; i < this.getPlayerCount(); i++) {
			if (totalOnlinePlayers[socket_id] == this.PlayersList[i].username) {
				isFound = true;
				break;
			}
		}
		return isFound;
	}

	isGameOpen() {
		/*
			Returns whether a game is open or closed
		*/
		return this.gameOpen;
	}

	isDisconnected() {
		/* Function compares # actively connected players vs # of player objects in game  

			Returns
			Boolean: whether there is a disconnection or not
		*/
		return this.connectedPlayers != this.getPlayerCount();
	}
	

	isPlayerReadyCustomCards(username) {
		/*
			Input the player's socket id

			If not already in array, adds player to array to denote ready status
		*/
		if (!(this.numPlayersReady.includes(username))) {
			this.numPlayersReady.push(username);
			console.log("Player is ready");
			return true;
		} else {
			return false;
		}
	}

	isTableReadyCustomCards() {
		/* Function compares # of players ready against player count

			Returns
			Boolean: whether table is ready to proceed to game step
		*/
		if (this.numPlayersReady.length == this.getPlayerCount()) {
			return true;
		} else {
			return false;
		}
	}

	isJudge(username) {
		/*  Check if the given username is the current judge --> boolean

		Parameters:
		username (string) username of the user

		Returns
		Boolean: whether or not the player is the judge

		*/
		for (let i = 0; i < this.getPlayerCount(); i++ ) {
			let player = this.PlayersList[i];
			if (player.username === username) {
				return player.judge;
			}
		}

		throw username + " ain't a valid username in the PlayersList! ";

	}

	playerAddedCustomCard(username) {
		/*
			Returns whether current player has added their custom cards
		*/
		return this.numPlayersReady.includes(username);
	}

	allAddedCustomCards() {
		/*
			Returns whether all players have added their custom cards
		*/
		return this.numPlayersReady.length == this.getPlayerCount();
	}

	hasPlayed(username){
		/* Check whether player has played yet --> boolean
		
		Parameters 
		username (string)

		Returns:
		True/ False - set membership
		*/
		return this.played.has(username);
	}

	everyonePlayed(){
		/* check whether every player has played 

		Returns: 
		True/False, everyone has played.
		*/

		return this.played.size === (this.getPlayerCount() - 1);
	}

	hasWinner() {
		/* returns Boolean if there is a winner
		*/
		return this.winner != null;
	}

	/* ------------------------------ Player Adding / Disconnecting --------------------------------------*/
	addDisconnectedPlayer(totalOnlinePlayers, socket_id) {
		/* Function for reconnecting a player that has disconnected by updating

		Parameters: 
		totalOnlinePlayers (array of objects: {socket.id:username} (globally defined in server.js)
		socket_id (string) socket.id of the query

		Returns:
		void

		*/
		for (let i = 0; i < this.getPlayerCount(); i++) {
			if (totalOnlinePlayers[socket_id] == this.PlayersList[i].username) {
				this.PlayersList[i].socket_id = socket_id;
				this.PlayersList[i].connection = true;
				break;
			}
		}
	}

	addPlayer(username, socket_id) {
		/* Adds a player to the current game by constructing a Player() object and pushing it to the end of the PlayerList

		Parameters: 
		username (string) username
		socket_id (string) socket.id

		*/

		let player = new Player(username = username, socket_id = socket_id);
		// console.log("Adding " + player.username + " to the PlayersList.")
		
		this.PlayersList.push(player);
	}

	/* ------------------------------- Main Game Logic Functions ---------------------------------- */

	initGame(n = 6) {
		/* Initializes the game by:
		 * 1) Drawing n cards for each player in this.PlayersList
		 * 2) Initializing the scoreboard of every player in this.PlayersList
		 * 3) Dealing the Prompt Card for everyone to see
		 * 4) Setting the first player as the judge

		 Parameters:
		 n (int) number of cards to deal for each player. Default value 5

		 Return:
		 void

		 */

		console.log("------ Initializing Game with " + this.getPlayerCount() + " player(s) ------ ");

		// 1) Draw n cards for each player
		this.PlayersList.map( player => player.drawCards(this.PlayerDeck, n));
		
		// 2) Initialize Scores
		for (let i = 0; i < this.PlayersList.length; i++) {
			let key = this.PlayersList[i].username;
			this.scores[key] = 0;
		}

		// 3)  Dealing prompt 
		this.dealPromptCard();

		// 4) set First player in the list as the initial judge
		this.PlayersList[0].judge  = true;

		// 5) set round to 1
		this.round = 1;

	}

	dealPromptCard() {
		/* Deals the prompt card from the prompt Deck */
		this.promptCard = this.PromptDeck.drawCard();
	}

	buildSentence(idx) {
		/* builds the complete Prompt + answer 
		 Parameters:
		 idx (int) index of the Card object on the winning answer (from the Judge Hand) 

		 Return
		 completed_text (string) : the string built from combining prompt and answer */

		 
		 let prompt_text = this.promptCard.value;
		 let answer_text =  this.judgeHand[idx].value;
		 
		 let pattern = /[_]+/;
		 let completed_text;
		 
		 let match_found = pattern.test(prompt_text);
		 
		 if (match_found) {
		 	completed_text = prompt_text.replace(pattern, answer_text);
		 } else {
		 	completed_text = `${prompt_text} ${answer_text}`;
		 }

		 return completed_text

	}

	newJudge() {
		/* Rotates to next judge, and updating the judge.idx by:
		 * 1) Current judge is no longer judge, and incrementing it to the next judge
		 * 2) Dealing with rotation (modulus)
		 * 3) Assigning judge to the next Player

		*/
		this.PlayersList[this.judgeidx++].judge = false; // 1 
		this.judgeidx %= this.getPlayerCount(); // 2
		this.PlayersList[this.judgeidx].judge = true; // 3

		console.log(`The new judge is now: ${this.PlayersList[this.judgeidx]}`);
	}


	cardPlayed(card_idx, username) {
		/* A player (candidate) has played a card to send to the judge to decide by: 
		 * 1) Getting the Player object of the player who played the card
		 * 2) Invoking Player.playCard() method on the player with the card index (card_idx)
		 * 3) Pushing the Card object played to the judgeHand 

		Parameters:
		card_idx (int) A value between 0 - 4 for a 5-card hand 
		player (string) The username of the player

		Returns:
		void 

		*/ 
		//1)
		let card_player = this.getPlayer(username);
		//2)
		let played_card = card_player.playCard(card_idx, this.PlayerDeck);
		
		//3)
		console.log("Played card is: " , played_card);
		this.judgeHand.push(played_card);
		this.played.add(username);

	}


	switchAnswerState(winner_username) {
		/* Ends the current judging phase and switches to Answering phase  
		 * 1) Reset who has played a card in the round, the judge's pile
		 * 2) Deal a new prompt (black card) and find a new judge
		 * 3) Update the scores
		 * 4) Set the current state to 'answer'
		
		Parameters:
		winner (JSON object) username of the winner of that round

		Returns:
		void

		*/
		// 1)
		this.played.clear(); 
		this.judgeHand = [];

		// 2)
		this.dealPromptCard();
		this.newJudge();

		// 3)
		console.log(`Updating the scores because ${winner_username} has won the round`);
		if (this._updateScoresAndCheckWinner(winner_username)) {
			this.endGame(winner_username);
		}

		// 4
		if (this.gameState == 'judge') {
			
			this.gameState = 'answer';
			console.log(`**************** swapped to gamestate: ${this.gameState} <-- should say answer ****************`);

			/* This section is just for debugging
			let entries = [];
			for (let item of this.played.keys()) entries.push(item);
			console.log(`Played is ${entries} JudgeHand is ${this.judgeHand.length}`);
			*/

		} else if (this.gameState === 'answer') {
			throw `Error! Looks like gamestate is already in answer`;
		} else {
			throw `Error! ${this.gameState} is not a valid gamestate`;
		}

		//5 add 1 to round
		this.round++;
	}

	switchJudgeState() {
		/* Ends the current answering phase and switches to Judging phase
		 * 1) Checks if the judgeHand has correct amount of cards
		 * 2) Set the current state to 'judge'
		
		*/

		 // 1)
		 if (this.judgeHand.length != this.getPlayerCount() - 1) {
		 	throw `Oops! There's something wrong with the judgeHand: ${this.judgeHand}`
		 }

		 // 2) 
		 this.gameState = 'judge';
		 console.log(` *********** swapped to gamestate: ${this.gameState}, <-- should say judge ****************** `)
	}
	
	_updateScoresAndCheckWinner(username) { 
		/* Private method to update scores, and then check if that player is a winner.
		 
		Parameters:
		username (string) : username of the player to increment score

		Return:
		Boolean : whether or not that player's score who we just updated just won
		 */

		if (this.scores[username] === false) { // if the username can't be found
			throw `${username} cannot be found in ${this.score.keys()}`
		}

		this.scores[username]++;
		const WINNING_SCORE = 4;
		console.log(`Successfully updated score for ${username} to ${this.scores[username]}`);

		return this.scores[username] == WINNING_SCORE;
	}

	endGame(winner) {
		/* Ends the game 

		Parameters:
		winner (string) username of the winning player
		
		*/
		console.log(`${winner} is the winner of the game!`);
		this.winner = winner;
	}

	toString() {
		/* Printing for debugging */

		return `<game object>
		Players List: ${this.PlayersList}
		Scores: ${this.scores.toString()}
		Played: ${this.played.toString()}

		Decks:
		${this.PlayerDeck.toString()}
		${this.PromptDeck.toString()}

		Prompt: ${this.promptCard}
		Judge Hand: ${this.judgeHand}
		Current Judge: ${this.getJudgePlayer()}

		Game State: ${this.gameState}
		Winner? : ${this.winner}
		`
	}
}


