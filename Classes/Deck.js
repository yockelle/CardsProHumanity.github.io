// let PlayerDeck = { 0: {cardid: 0,
//     cardValue: 'Drinking alone'}, 
// 1: {cardid: 1,
//     cardValue: 'The glass ceiling,'},
// 2: {cardid: 2,
//     cardValue: 'the floor},
// };


// let promptCards = { 0: {cardid: 0,
//     cardValue: 'Daddy why is mommy crying?'}, 
// 1: {cardid: 1,
//     cardValue: 'What does Dick Cheney prefer?'},
// 2: {cardid: 2,
//     cardValue: 'I drink to forget __'},
// };

// Imports
const Card = require('./Card');
const funcutils = require('./funcutils')
const range = funcutils.range;



module.exports = class Deck {
    constructor(type) {
        // Type can be either "Player or Prompt"
        if (["Player", "Prompt", "player", "prompt"].includes(type)) {
            this.type = type;
            this.cards = range(1,351).map( i => new Card(i)); 
        } else {
            throw type + " is not a valid parameter for constructing a Deck";
        }
                   
  }

    drawCard() {
        // Randomly draw 1 card from the deck. To be used by Players class only.
        let randomIndex = Math.floor(Math.random()*this.cards.length);
        let card = this.cards.splice(randomIndex, 1)[0] 
        return card;
    }

    getLength() {
        // returns length of card deck
        return this.cards.length;
    }

    toString() {
        return "Cards contained in deck: " + this.cards;
    }


}
