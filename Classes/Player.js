
module.exports = class Player {
   
    constructor(username,socket_id) {
        /* Player object represents the player
        
        Parameters:
        username (string) login username ex: bob415
        socket_id (string) socket identification taken from: socket.id ex: fCBvb48UZhYozvLPAAAA
        
        Return:
        void

        */

        // Log in information
        this.username = username; 
        this.socket_id = socket_id;
        
        // Hand
        this.hand = []; // Array of Card objects
        this.judge = false; // boolean whether the Player is a judge or not

        // Connection
        this.connection = true; // Whether play is connected or not
    }

    drawCards(deck, number) {
    	/* Draws number of cards from the Deck to player's hand.
      
      Parameters:
      deck (Deck object) passed by reference, the deck to draw cards from
      number (int) number the decks 

      Return:
      void

      Sample usage: Drawing 5 cards from a player Deck of 300 cards
      let bob = new Player('bob415', 'fCBvb48UZhYozvLPAAAA');
      let amy = new Player('amy415', 'fCBvbZZZZZZLPAAAAs3')
      
      let playerCardDeck = new Deck('Player', amount=300); 
      Player.drawCards(playerCardDeck, 5);
      Player.drawCards(playerCardDeck, 5);
      
      */

    	for (let i = 0; i < number; i++){
        let drawn_card = deck.drawCard(this.username);
    		this.hand.push(drawn_card);
    	}
    }

   	playCard(index, deck) {
      /* Player plays a card from their hand, and then replaces it with a new card from the deck

      Parameters:
      index (int) index number of the card being played (0 to 5)
      deck (Deck object) the deck to draw new replacement card from
      
      Return
      card (Card object) The card that is being played

      Sample usage: Player plays the card at index 3.

      let card_played = bob.playCard(3, playerCardDeck);
      
      */
   		
   		if (index >=  this.hand.length) {
   			throw "IndexError: The index:" + index + " is out of bounds! " ;
   		}
      // *TODO*  don't draw card until after round ends
      // return this.hand.splice(index,1) 
      let card = this.hand.splice(index,1, deck.drawCard(this.username))[0];
   		return card
   	}

   	toString() {
      /* Format
      
      Sample:
      >>> console.log(bob);
      <Player( 'bob415', 'fCBvb48UZhYozvLPAAAA')>

      */
   		return `<Player('${this.username}', ${this.socket_id})>`
   	}
  }