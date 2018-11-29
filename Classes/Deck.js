// custom dependencies
const Card = require('./Card');
const funcutils = require('./funcutils')
const range = funcutils.range;

// Reading file line by line dependencies
const fs = require('fs');
const readline = require('readline');
const stream = require('stream');


module.exports = class Deck {
    
    constructor(type, amount=350, custom_player='/array.txt', custom_prompt ='/array.txt') {
        
        let customs = {
            player: custom_player,
            prompt: custom_prompt
        }

        if (["Player", "Prompt"].includes(type)) {
            this.type = type;
            this.cards = this._mapCards(this.type, customs) ;
        } else {
            throw type + " is not a valid parameter for constructing a Deck";
        }                  
  }

    _mapCards(type, customs) {
        // Private function: , maps each card with the card values depending on type of deck
        
        let file_path, custom_path;       
        
        switch (type) {
            case "Player":
                file_path = __dirname + "/playercards.txt"
                custom_path = __dirname + customs['player'];
                break;
            case "Prompt":
                file_path = __dirname + "/promptcards.txt"
                custom_path = __dirname + customs['prompt'];
                break;
        }
        
        // Reads default (d) deck and custom (c) deck into an array of strings
        let d_lines = fs.readFileSync(file_path, 'utf-8').split('\n');
        let c_lines = fs.readFileSync(custom_path, 'utf-8').split('\n');

        let cards = d_lines.concat(c_lines);

        var i = 0; // incremental counter for id
        return cards.map( (value) => new Card(i++, value))

    }

    drawCard(owner) {
        let randomIndex = Math.floor(Math.random()*this.cards.length);
        let card = this.cards.splice(randomIndex, 1)[0]
        card.setOwner(owner); 
        return card;
    }

    getLength() {
        return this.cards.length;
    }

    toString() {
        return "Cards contained in deck: " + this.cards;
    }


}
