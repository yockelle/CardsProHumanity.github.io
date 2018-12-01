
module.exports = class Card {

	constructor(id, value) {
		
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
    	return "CID#" +  this.id + " Text: " + this.value + " Owner " + this.owner;
  	};

}