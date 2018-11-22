
// Dependencies
const Table = require('./Table');
const Player = require('./Player');


// To be scraped from Lobby when game starts.
/*  something like this:
socket.on('Start', function(data) {
	// data will have list of players and usernames, map the list into a new players list
})
*/ 

var PlayersList = [new Player(123, 'Aaron', 789), new Player(144, 'Ellie', 999),
					new Player(155, 'Orlando', 666 ), new Player(200, 'Kevin', 222),
					new Player(201, 'Natalia', 222), new Player(202, 'Diane', 222)];

var game = new Table(PlayersList);





// Initializing hands, prompt, and scores
game.dealStartingCards();
game.dealPromptCard();
game.initializeScores();


// For debugging 
const winning_score = 5;
var judge_index = 0 ;


// Main game loop. whoever scores 5 wins


