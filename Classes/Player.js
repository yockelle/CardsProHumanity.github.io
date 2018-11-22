// let AllPlayers = {DEDFAEX : {
//     username: 'Joe_Schmoe',
//     password: "abc",
//     unquieID: "DEDFAEX",
//     gameSession: {
//         1 : {
//             numberOfCards : 3,
//             userhand: [Cards[0] , Cards[1] , Cards[2]],
//             promptCard: promptCards[0],
//         }
//     },
// },

module.exports = class Player {
    constructor(uniqueId,username,password) {
        // Log in information
        this.username = username;
        this.password = password;
        this.uniqueId = uniqueId;

        // Connection
        this.socketId;
        this.connected;

        this.gameSessions = [];

        // Hand
        this.hand = [];
        this.judge = false; 
    }

    drawCards(deck, number) {
    	// draws number of cards from the Deck to player's hand:
    	for (let i = 0; i < number; i++){
    		this.hand.push( deck.drawCard() );
    	}
    }

   	playCard(index, deck) {
   		// returns a card played at given index - and replaces it with a new card from deck
   		if (index >=  this.hand.length) {
   			throw "IndexError: The index:" + index + " is out of bounds! " ;
   		}
   		return this.hand.splice(index,1, deck.drawCard() );
   	}

   	toString() {
   		// display
   		return "Player: " + this.username + " Current_Hand: " + this.hand;
   	}



  }