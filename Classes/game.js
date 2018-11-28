const Player = require('./Player');
const Deck = require('./Deck');

module.exports = class Game {

	constructor() { 
		
		this.socket;

		//this.onlinePlayersList = {}; //might not be needed

		this.PlayersList = []; // List of Player objects. { username, socket_id, hand, judge, connection}
		this.scores = {};
		this.played = [];

		this.PlayerDeck = new Deck('Player');
		this.PromptDeck = new Deck('Prompt');
		
		this.promptCard;
		this.judgeHand = [];

	}

	/* Getters , setters */
	getPlayerCount() {
		return this.PlayersList.length;
	}

	getConnectedCount() {
		// returns amount of connected players
		let count = 0;
		for (let i = 0; i < this.getPlayerCount(); i ++){
			if (this.PlayersList[i].connection) {
				count++;
			}
		}

		return count;
	}

	isPartofGame(totalOnlinePlayers, socket_id) {
		let isFound = false;
		for (var i = 0; i < this.getPlayerCount(); i++) {
			if (totalOnlinePlayers[socket_id] == this.PlayersList[i].username) {
				isFound = true;
				break;
			}
		}
		return isFound;
	}

	addDisconnectedPlayer(totalOnlinePlayers, socket_id) {
		for (var i = 0; i < this.getPlayerCount(); i++) {
			if (totalOnlinePlayers[socket_id] == this.PlayersList[i].username) {
				this.PlayersList[i].socket_id = socket_id;
				this.PlayersList[i].connection = true;
				break;
			}
		}
	}

	setSocket(socket) {
		this.socket = socket;
	}


	addPlayer(username, socket_id) {
		let player = new Player(username = username, socket_id = socket_id )
		console.log("Adding " + player.username + " to the PlayersList.")
		
		this.PlayersList.push(player);
		// this.onlinePlayersList[socket_id] = username; //might not be needed
	}


	initGame(n = 5) {

		console.log("Initializing Game with " + this.getPlayerCount() + " player(s) ");

		// Draw n cards for each player
		this.PlayersList.map( player => player.drawCards(this.PlayerDeck, n));
		
		this.dealPromptCard();

		// Initialize Scores
		for (let i = 0; i < this.PlayersList.length; i++) {
			let key = this.PlayersList[i].username
			this.scores[key] = 0;
		}


	}

	dealPromptCard() {
		this.promptCard = this.PromptDeck.drawCard();
	}

	cardPlayed(card_idx, player) {
		
		let player_index = null;
		// Iterate through entier PlayersList to get the index of player
		for (let i = 0; i < this.PlayersList.length; i++) {
			
			console.log(this.PlayersList[i].username);
			
			if (player === this.PlayersList[i].username) {
				player_index = i;
			}
		}
		if (player_index === null) {
			throw player + " could not be found in the table. Please see cardPlayed() func in game.js"
		}

		let played_card = this.PlayersList[player_index].playCard(card_idx, this.PlayerDeck);
		this.judgeHand.push(played_card);

	}

	resetTable() {
        this.PlayerDeck = new Deck("Player");
        this.PromptDeck = new Deck("Prompt");

        this.promptCard;
        this.handCards = {};
        this.tableCards = {};
    }

	endRound(data) {

	}


}


