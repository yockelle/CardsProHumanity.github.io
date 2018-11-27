
module.exports = class Card {

	constructor(id) {
        this.id = id;
        this.value = "empty";
	}
	
	toString() {
    	return "CID#" +  this.id;
  	};

}