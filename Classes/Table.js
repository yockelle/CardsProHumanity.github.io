const Deck = require('./Deck');

module.exports = class Table {
    constructor(PlayersList) {
        /* Constructs a game with given PlayersList:
        PlayersList : Array of Players.
        PlayerDeck : Deck , Array of Cards
        PromptDeck : Deck , Array of Cards 
        promptCard : Current card
        */
        this.PlayersList = PlayersList;
        this.PlayerDeck = new Deck("Player");
        this.PromptDeck = new Deck("Prompt");
                
        this.scores = {};
        this.promptCard;

        // Array to hold all cards submitted for the Judge to select
        this.judgeHand = []; 
  }

    // Getters
    getPlayersList() {
        return this.PlayersList;
    }

    getPlayerCount() { 
        return this.PlayersList.length;
    }


    // Table initialization functions
    dealStartingCards(n = 5) {
        // For each player, draw 5 cards from PlayerDeck
        this.PlayersList.map( player => player.drawCards(this.PlayerDeck, n) ) ;     
    }

    dealPromptCard() {
        this.promptCard = this.PromptDeck.drawCard();
    }

    initializeScores() {
        // Scores is a Hashmap. Key = username, Value = score
        for (let i = 0; i < this.PlayersList.length; i++) {
            let key = this.PlayersList[i].username
            this.scores[key] = 0; 
        }
    }


    pushJudge(card) {
        // Pushes card played to judgeHand
        this.judgeHand.push(card);
    }

    resetTable() {
        this.PlayerDeck = new Deck("Player");
        this.PromptDeck = new Deck("Prompt");

        this.promptCard;
        this.handCards = {};
        this.tableCards = {};
    }

}