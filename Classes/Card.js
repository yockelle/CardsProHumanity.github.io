
module.exports = class Card {

	constructor(id, value) {
        this.id = id;
        this.value = value;
        this.owner = "null" ; // owner of the card. null for part of the deck
	}
	
	setOwner(owner) {
		this.owner = owner;
	}

	toString() {
    	return "CID#" +  this.id + " Text: " + this.value + " Owner " + this.owner;
  	};

}