/* Test JS for debugging - observe through console.logs */ 


// Dependencies
const Table = require('./Table');
const Player = require('./Player');
const Deck = require('./Deck');


// To be scraped from Lobby when game starts.
var PlayersList = [new Player(123, 'Aaron', 789), new Player(144, 'Ellie', 999),
					new Player(155, 'Orlando', 666 ), new Player(200, 'Kevin', 222),
					new Player(201, 'Natalia', 222), new Player(202, 'Diane', 222)];

var mainTable = new Table(PlayersList);



// Initializing hands, prompt, and scores
mainTable.dealStartingCards();
mainTable.dealPromptCard();
mainTable.initializeScores();

// For debugging 
var iterations = 30;
var max_score = 5;
var judge_index = 0 ;


// Main game loop. whoever scores 5 wins
while (iterations > 0) {
	
	judge_index %= PlayersList.length; // index position of the judge
	
	// Print out the current judge
	var current_judge = PlayersList[judge_index].username;
	console.log( "Current judge is: " + current_judge);

	// produce a prompt
	mainTable.dealPromptCard();
	console.log("The current prompt is: " + mainTable.promptCard);
	
	console.log("----------Now we enter the player turns----------------");
	// Iterate through each player in the list
	for (let i = 0; i < mainTable.getPlayerCount(); i++) {

		if (i != judge_index) { // They will play a card at random, unless they are the judge 

			let randomIndex = Math.floor(Math.random()*4);
						
			// Play the card onto the judge hand
			let cardPlayed = mainTable.PlayersList[i].playCard(randomIndex, mainTable.PlayerDeck);
			mainTable.pushJudge(cardPlayed);

			console.log(mainTable.PlayersList[i].username + " plays a random card at index: " + randomIndex + " which is the card: " + cardPlayed);

			
			//console.log("Their hand is now: " + mainTable.PlayersList[i]);

			console.log("Judge hand is now: " + mainTable.judgeHand);
		}
	}

	console.log("--------------------- Judging round ---------------------------")
	console.log("Everyone now has a card. Here is what they have played: " + mainTable.judgeHand)

	let randomIndex = Math.floor(Math.random()*4);
	// Will probably need to scramble the order, using hashmap to remember who played what card

	let winner_name = PlayersList[randomIndex].username;
	console.log ("Judge:" + current_judge + " randomly selects card: " + mainTable.judgeHand[randomIndex] 
		+ " which was played by: " + winner_name);

	// +1 score
	mainTable.scores[winner_name] += 1;
	if (mainTable.scores[winner_name] === max_score) {
		console.log("----- Winner -----: " + winner_name);
		break;
	}
	
	mainTable.judgeHand = [];

	console.log("Current score is: ");
	for (let key in mainTable.scores) {
		console.log (key + ":" + mainTable.scores[key]);
	}

	judge_index ++;
	iterations--;


}