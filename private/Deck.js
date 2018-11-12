// The Imports
const funcutils = require('./funcutils');
const range = funcutils.range;

// Todo: Have it communicate with database


class Deck {

	/* Class for the entire deck of Cards Against Humanity (for the players)
	Each 'card in the deck is assigned an int number from 0 .. whatever
	*/

	constructor(number) {
		/* creates of deck of cards numbered from 0 ... n */
		this.deck = range(0,number);
	}

	drawPlayerCards(number) {
		/* Draws number of cards from the deck. Then just returns the cards drawn (just array of ints) */

		let random_num, new_card;
		let cards_drawn = [];

		for (let i = 0; i < number ; i++) {
			let index = Math.floor(Math.random() * (this.deck.length - 1)); 
			let new_card = this.deck.splice(index,1);
			cards_drawn.push(new_card);
		}

		return cards_drawn;

	}

}
/* --- For debugging ---
let deck = new Deck(10);
console.log(deck.drawPlayerCards(3));
console.log(deck);
*/ 
