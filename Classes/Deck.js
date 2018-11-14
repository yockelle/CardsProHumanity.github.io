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

const Card = require('./Card');

module.exports = class Deck {
    constructor(type) {
        if (type === "Player") {
            this.cards = [new Card(0,"Drinking Alone"),
                            new Card(1,"The glass ceiling,"),
                            new Card(2,"The floor"),
                            new Card(3,"Smoking Weed"),
                            new Card(4,"Donald Trump"),
                            new Card(5,"Getting Fired!"),
                            new Card(6,"Sample5"),
                            new Card(7,"Same6"),
                            new Card(8,"Sameeee"),
                            new Card(9,"Sameeeeeasfdasdf"),
                            new Card(10,"You are happy!"),
                        ];
        }
        else if (type === "Prompt") {
            this.cards = [new Card(0,'Daddy why is mommy crying?'),
                            new Card(1,'What does Dick Cheney prefer?'),
                            new Card(2,'I drink to forget __')];
        }
        else {
            this.cards = [];
        }
  }

    drawCard() {
        let randomIndex = Math.floor(Math.random()*this.cards.length);
        let card = this.cards.splice(randomIndex, 1)[0] //remove card and assign to var
        return card;
    }


}