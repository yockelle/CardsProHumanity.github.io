const Card = require('./Card');
const funcutils = require('./funcutils')
const range = funcutils.range;

module.exports = class Deck {
    constructor(type) {
        if (["Player", "Prompt", "player", "prompt"].includes(type)) {
            this.type = type;
            this.cards = range(1,351).map( i => new Card(i)); 
        } else {
            throw type + " is not a valid parameter for constructing a Deck";
        }                  
  }

    drawCard() {
        let randomIndex = Math.floor(Math.random()*this.cards.length);
        let card = this.cards.splice(randomIndex, 1)[0] 
        return card;
    }

    getLength() {
        return this.cards.length;
    }

    toString() {
        return "Cards contained in deck: " + this.cards;
    }


}
