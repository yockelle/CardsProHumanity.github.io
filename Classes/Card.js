
module.exports = class Card {

	constructor(id, value) {
		/* Constructor for Card 
		id  (int) numbered 0 to 350
		value (string) text value of the card. example "Hello _____ World"
		owner (string) just the username of the owner - from the Player Object
		*/
		
        this.id = id;
        this.value = value;
        this.owner = "null" ; // owner of the card. null for part of the deck
	}
	
	/* Getters and Setters */
	
	getOwner() {
		
		return this.owner;
	}
	setOwner(owner) {
		this.owner = owner;
	}

	toString() {
    	return `<Card(${this.id}, '${this.value}', ${this.owner}')`;
  	};

}