const Deck = require('./Deck');

module.exports = class Table {
    constructor(gameID,PlayersList) {
        this.PlayersList = PlayersList;
        this.PlayerDeck = new Deck("Player");
        this.PromptDeck = new Deck("Prompt");
        // this.gameID = gameID;
        // this.status = "Open";
        
        // this.scores = {};
        // this.round;
        // this.currJudge;
        this.promptCard;
        this.handCards = {};
        this.tableCards = {};
  }

    dealStartingCards(n = 5) {

        //Give 5 Cards to each Player
        for(let i = 0; i < this.PlayersList.length; i++) {
            let currPlayer = this.PlayersList[i].uniqueId;
            let hand = [];

            //draw 5 cards
            for (let j = 0; j < n; j++) {
                let currCard = this.PlayerDeck.drawCard();
                hand.push(currCard);
            }

            this.handCards[currPlayer] = hand;
        }

    }

    playCard(player,card) {

        let playerId = player.uniqueId;
        let playerHand = this.handCards[playerId];

        let indexOfCard = this.__findIndexOfCard(card,playerHand);

        //remove from hand
        this.handCards[playerId].splice(indexOfCard, 1) //remove card and assign

        //add card to tableCards
        this.tableCards[playerId] = card;
        
    }

    __findIndexOfCard(card, hand) {

        //loop through the cards that the player has
        for(let i = 0; i < hand.length; i++) {
            let currCardID = hand[i].id;
            if(card.id === currCardID) {

                return i;
            }
        }

        return -1;

    }


    dealPromptCard() {
        this.promptCard = this.PromptDeck.drawCard();
    }

    resetTable() {
        this.PlayerDeck = new Deck("Player");
        this.PromptDeck = new Deck("Prompt");

        this.promptCard;
        this.handCards = {};
        this.tableCards = {};
    }

}