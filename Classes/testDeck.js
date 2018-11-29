const Player = require('./Player');
const Deck = require('./Deck');
const Card = require('./Card');

var deck = new Deck("Player");

var player1 = new Player("bob", 1234);

player1.drawCards(deck, 5);

console.log(player1.hand);