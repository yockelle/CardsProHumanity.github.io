
class Player {

	constructor(seat_no, username, deck) {
		/* Creates a player */
		
		this.seat = seat_no; // The seat number will be rotated to determine who is a judge

		this.user = username; // Connects with the username on the database

		this.hand = deck.drawPlayerCards(7); // Initialize hand with 7 cards
		
		this.judge = false;
	}

	playCard(index) {
		// Plays the card from Player's hand at specified index
		
		card_played = this.hand.splice(index,1);
		return card_played;
	}




}