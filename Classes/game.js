const Player = require('./Player');
const Deck = require('./Deck');

module.exports = class Game {

	constructor() { 

		const WINNING_SCORE = 10; // Note: Javascript ES6 doesn't have class variables 
		
		this.connectedPlayers = 0;
		this.numPlayersReady = [];

		this.PlayersList = []; // List of Player objects. { username, socket_id, hand, judge, connection}
		this.scores = {};
		this.played = [];

		this.PlayerDeck = new Deck('Player');
		this.PromptDeck = new Deck('Prompt');
		
		this.promptCard;
		this.judgeHand = []; // Array { card_owner, card }

		this.judgeidx = 0; // index of the current judge

	}

	/* Getters , setters */
	getPlayerCount() {
		return this.PlayersList.length;
	}

	getJudgePlayer() {
		// Gets player object of the judge
		return this.PlayersList[this.judgeidx]
	}
	isPartofGame(totalOnlinePlayers, socket_id) {
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

		for (let i = 0; i < this.getPlayerCount(); i++ ) {
			let player = this.PlayersList[i];
			if (player.username === username) {
				return player.judge;
			}
		}

		throw username + " ain't a valid username in the PlayersList! ";

	}


	addDisconnectedPlayer(totalOnlinePlayers, socket_id) {
		for (let i = 0; i < this.getPlayerCount(); i++) {
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
		// set First player in the list as the initial judge
		this.PlayersList[0].judge  = true;

	}

	newJudge() {
		// rotates to next judge
		this.PlayersList[this.idx++] = false;
		this.idx %= this.getPlayerCount;
		this.PlayersList[this.idx];
	}

	updateScores(username) {
		this.scores[username] += 1;
		if (this.scores[username] == WINNING_SCORE) {
			// WIP
			continue;
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

	endRound(winner) {
		// this is called when judge plays a card 
		this.played = [] 
		this.judgeHand = []
		this.dealPromptCard();
		this.newJudge();

	}

}


