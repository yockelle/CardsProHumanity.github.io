// custom dependencies
const Card = require('./Card');
const funcutils = require('./funcutils')
const range = funcutils.range;

// Reading file line by line dependencies
const fs = require('fs');
const readline = require('readline');
const stream = require('stream');


module.exports = class Deck {
    
    constructor(type, amount=350, custom_path='/array.txt') {
        /* Deck object constructs cards based on custom files

        Parameters:
        type (string) Can be either "Player" or "Prompt" , error otherwise
        amount (int) (default=350) Amount of cards in the deck

        custom_path (string) (default='/array.txt') Path to the custom file

        */

        if (["Player", "Prompt"].includes(type)) {
            this.type = type;
            this.cards = this._mapCards(custom_path) ;
        } else {
            throw type + " is not a valid parameter for constructing a Deck";
        }                  
  }

    _mapCards(custom_path) {
        /* Private function: , maps each card with the card values depending on type of deck
        To be only used in the constructor
        
        Parameters:
        custom_path (string) Path to the file of the custom cards

        Return:
        An array of Card objects of card.id, value, and default ownerless
        */

        let file_path;
        let custom_lines; // Array of strings produced for each line of the custom file 
        
        switch (this.type) {
            case "Player":
                file_path = __dirname + "/playercards.txt"
                custom_path = __dirname + custom_path;
                custom_lines = fs.readFileSync(custom_path, 'utf-8').split('\n');

                break;
            case "Prompt":
                file_path = __dirname + "/promptcards.txt"
                custom_lines = []; // no custom line necessary
                break;
        }
        
        // Reads default (d) deck deck into an array of strings
        let default_lines = fs.readFileSync(file_path, 'utf-8').split('\n');

        // Combine the custom cards with actual cards
        let cards = default_lines.concat(custom_lines);

        var i = 0; // incremental counter for id
        return cards.map( (value) => new Card(i++, value.trim()));

    }

    getSize() {
        /* Returns the cards left in the deck */
        return this.cards.length;
    }

    drawCard(owner) {
        /* Draws a card of the decker, assigning it to an owner 
        
        Parameters:
        owner (string) The owner to assign the card to when drawn (Player.username)

        Returns:
        Randomly drawn Card object with owner set to who drew it
        */
       
        let randomIndex = Math.floor(Math.random()*this.cards.length);
        let card = this.cards.splice(randomIndex, 1)[0]
        card.setOwner(owner); 
        return card;
    }

    getLength() {
        return this.cards.length;
    }

    toString() {
        /* Format

        Sample:
        >>> console.log( new Deck('Prompt'));
        <Deck('Prompt') 350>
        */

        return `<Deck('${this.type}) ${this.getLength()}>)`;
    }


}
