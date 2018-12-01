const Player = require('./Player');
const Deck = require('./Deck');
const Card = require('./Card');
const game = require('./game')

var table = new game();

table.addPlayer("bob415", 123);
table.addPlayer("a", 222);

table.initGame();

table.cardPlayed(3, "bob415"); // bob plays card #3
table.cardPlayed(4, "bob415");

console.log(table.judgeHand[0]['value']);

console.log(table.getGameState());