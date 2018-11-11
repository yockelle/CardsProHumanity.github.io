/*
// Client side JS file

*/

// initialize socket connection
var socket = io();

function produceCard(cardID) {
	// This function is adopted from Aaron - it just makes a div and makes the card

	let mainDiv = document.createElement('div');
    mainDiv.className = 'card';

    let image = document.createElement("IMG");
    image.setAttribute("src", "https://cardsagainsthumanity.com/images/BlackCard.png");
    image.setAttribute("width", "35%");
    image.setAttribute("alt", "Avatar");

    let insideDiv = document.createElement('div');
    insideDiv.className = 'container';
    let h4 = document.createElement('H4')
    let boldText = document.createElement('strong').appendChild(document.createTextNode(cardID));
    h4.appendChild(boldText);
    
    insideDiv.appendChild(h4);
    insideDiv.appendChild(document.createElement("P")).appendChild(document.createTextNode("Player Card"));
    
    mainDiv.appendChild(image);
    mainDiv.appendChild(insideDiv);

    document.getElementById("CardDisplayField").appendChild(mainDiv);
}


// Listening from Server (receiving)
socket.on('cardPlayed', function cardPlayed(data) {

	// This function receives a card being played from the server, and updates the HTML.
	// Receives data:
	// Which is a JSON objct with username (socketid), and the cardid played 

	console.log("I have received a card being played from: " + data.username);
	
	let cardid = data.cardid;
	produceCard(cardid);
	

});
function sendCard(cardid) {

	// Function activated when a button is clicked. Sends the card being played to the server, and the socket.id of who sent it
	
	var data = {
		cardid: cardid,
		username: socket.id
	}
	
	console.log('Sending the card ' + data.cardid + ' to Server');
	produceCard(cardid);
	socket.emit('cardPlayed', data);

}


