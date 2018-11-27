/* -------------
Client side JS file

 -----------------*/

// initialize socket connection. Should only do this once
var socket = io();


/* ----- User Registration ----- */
function userRegister() {
	console.log('Sending Registration Data to Server');
	var inputname = document.getElementById('inputname').value;
	var inputpass = document.getElementById('inputpass').value;

	//Checks to make sure inputs are good
	if (inputname != "" && inputpass != "") {
		var user_data = {
			username: inputname,
			password: inputpass
		}
		socket.emit("Register", user_data);

		document.getElementById('inputname').value = '';
		document.getElementById('inputpass').value = '';

	} else {

		alert("Username and/Or Password Cannot be blank!")
	}
} // end of userRegister

// Registration Listen
socket.on('Registration_Status', function (data) {
	alert(data);
	console.log('Received' + data);
});

// Online_Players_list Listen
socket.on('Online_Players_List', function (data) {

//HTML TEMPLATE
	/* <ul id="sortable">
		<li>
			<div class="media">
				<div class="media-left align-self-center">
					<img class="rounded-circle" src="/public/Player_Avatar.jpg">
				</div>
				<div class="media-body">
					<h4>Bob1123</h4>
					<p>SocketID: aDEFA123</p>
				</div>
			</div>
		</li>
	</ul> */

	let k = ('<ul id="sortable">');
	for (key in data) {
		console.log("Current Players:", "SocketID: ", key, "UserName: ", data[key])

		k += ('<li>' +
			'<div class="media">' +
			'<div class="media-left align-self-center">' +
			'<img class="rounded-circle" src="/public/Player_Avatar.jpg">' +
			'</div>' +
			'<div class="media-body">');
		k += ('<h4>'+ data[key]+ '</h4>');
		k += ('<p>SocketID: '+key+ '</p>');
		k += ('</div></div></li>');
	};

	k += '</ul>';
	document.getElementById('PlayerList').innerHTML = k;
});


/* ------ User Login ------ */
function userLogin() {
	console.log('Send user data to server');
	var inputname = document.getElementById('inputname').value;
	var inputpass = document.getElementById('inputpass').value;

	//Checks to make sure inputs are good
	if (inputname != "" && inputpass != "") {
		var user_data = {
			username: inputname,
			password: inputpass
		}
		socket.emit("Login", user_data);


		document.getElementById('inputname').value = '';
		document.getElementById('inputpass').value = '';
	} else {
		alert("Username and/Or Password Cannot be blank!")
	}
}
// Login Listen: When Server authenticates login, it will emit a success. This socket will receive it.
socket.on('Login_Status', function (data) {

	console.log('Login Status: ' + data);
	if (data.sucess) {
		document.getElementById("Lobby").style.display = "block";
		document.getElementById("LoginForm").style.display = "none";

	}
});

/* ------ Public Board (cards) functions ------ */
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