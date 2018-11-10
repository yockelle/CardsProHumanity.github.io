// Client side:
// Player's private hands


// todo:

// has 7 cards, and transmits the card played to the server 
// which will relay it to the public_board



//@p5
function setupHand() {

}


function Card(text, id) {
	this.text = text;
	this.id = id; // id # for the random card
}

function clickedCard(button, x, y) {
	// transmits the click to server
	console.log("Clicked")
	var clickedPosition = {
		x: x,
		y: y
	}
	socket.emit('clickedCard', clickedPosition);
}

setupHand()