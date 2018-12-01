const Player = require('./Player');
const Deck = require('./Deck');

module.exports = class Game {

	constructor() { 
		
		// Pre-Game Connection and Card Customization information
		this.connectedPlayers = 0; // Counter of 
		this.numPlayersReady = []; // Array storing the usernames of those who have pressed 'Ready' for custom card

		// Player & Scoring information
		this.PlayersList = []; // List of Player objects. { username, socket_id, hand, judge, connection}
		this.scores = {};
		this.played = [];

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

		console.log("Initializing Game with " + this.getPlayerCount() + " player(s) ");

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

	}

	dealPromptCard() {
		/* Deals the prompt card from the prompt Deck */
		this.promptCard = this.PromptDeck.drawCard();
	}

	newJudge() {
		/* Rotates to next judge, and updating the judge.idx by:
		 * 1) Current judge is no longer judge, and incrementing it to the next judge
		 * 2) Dealing with rotation (modulus)
		 * 3) Assigning judge to the next Player

		*/

		this.PlayersList[this.judgeidx++].judge = false; // 1 
		this.judgeidx %= this.getPlayerCount; // 2
		this.PlayersList[this.judgeidx].judge = true; // 3

		console.log(`The new judge is now: ${this.PlayersList[this.idx]}`);
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
		let card_player = this.getPlayer(username);
		let played_card = card_player.playCard(card_idx, this.PlayerDeck);
		
		console.log("Played card is: " , played_card);
		this.judgeHand.push(played_card);

	}


	switchAnswerState(winner) {
		/* Ends the current judging phase and switches to Answering phase  
		 * 1) Reset who has played a card in the round, the judge's pile
		 * 2) Deal a new prompt (black card) and find a new judge
		 * 3) Update the scores
		 * 4) Set the current state to 'answer'
		
		Parameters:
		winner (string) username of the winner of that round

		Returns:
		void

		*/
		// 1)
		this.played = [] 
		this.judgeHand = []

		// 2)
		this.dealPromptCard();
		this.newJudge();

		// 3)
		if (this._updateScoresAndCheckWinner(winner)) {
			this.endGame(winner);
		}

		// 4
		if (this.gameState == 'judge') {
			this.gameState == 'answer';
			console.log(`Successfully swapped gameState to answer`);
		} else if (this.gameState === 'answer') {
			throw `Error! Looks like gamestate is already in answer`;
		} else {
			throw `Error! ${this.gameState} is not a valid gamestate`;
		}
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
	}
	
	_updateScoresAndCheckWinner(username) { 
		/* Private method to update scores, and then check if that player is a winner.
		 
		Parameters:
		username (string) : username of the player to increment score

		Return:
		Boolean : whether or not that player's score who we just updated just won
		 */
		this.scores[username] += 1;
		const WINNING_SCORE = 10;

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

}

