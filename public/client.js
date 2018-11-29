

/* -------- Global Variables for the client  ----------- */
var socket = io();

var user = {
	username: "null",
	socket_id: "null"
}


/* --------------------------------------- Button-click functions  ------------------------------------------------- */
function userRegister() {
	// Emitted on 'Register' button click
	console.log('Sending Registration Data to Server');
	var inputname = document.getElementById('inputname').value;
	var inputpass = document.getElementById('inputpass').value;

	// Checking if input is valid
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
}; 
function userLogin() {
	// Emitted on 'Login' button click
	// console.log('Sending user login info to server');
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
}; 

function joinGameOne() {
	// Emitted on 'Join' button click
	socket.emit("joinGameOne");
}

function initGame() {
	// Emitted on 'Start' button click
	socket.emit("initGame", true);
}

function continueGame() {
	// Emitted on 'Continue' button click
	socket.emit("continueGame");
}
// TODO
function sendCard(card_idx, type) { 
	// Emited upon clicking a card 
	var data = {
		card_idx: card_idx,
		username: user.username,
		socket_id: user.socket_id
	}

	console.log('Sending the card ' + data.card_id + ' to Server');
	if (type == 'candidate' ) {
		socket.emit('cardPlayed', data);
	} else if (type == 'winner') {
		socket.emit('winnerSelected', data);
	}

}
function resetGame() {
	// Emited on 'Reset' button click
	console.log("Resetting Game Button Pressed. Sending Request to Server");
	socket.emit('ResetGameButtonPressed') //sending request to server to reset game
}

/* ------------------------------------ Card Creation Functions ------------------------------------ */
var cardNum = 1; //Keeps track of new cards entered by user
var cardsToAdd = []; //Array to hold new cards user enters

//Turns off lobby and login divs and turns on CustomCard div
function cardCreator() {
	document.getElementById("Lobby").style.display = "none";
	document.getElementById("LoginForm").style.display = "none";
	document.getElementById("CustomCards").style.display = "block";
}	

//Executes when user clicks Add New Card. Adds the input to cardsToAdd array and displays card to user
function addNewCardButton() {
	var cardInput = document.getElementById('cardInbox').value;
	cardsToAdd.push(cardInput);
	displayCards();
	resetCardInputScreen();	
}

function displayCards() {
	let k = "";
	for(let i = 0; i < cardsToAdd.length; i++) {
		//Doesn't need to be a button, just using for styling for now
		k += '<button id="card-CSS">' + cardsToAdd[i] +'</button>';
	}
	document.getElementById('displayCardsEntered').innerHTML = k;
}

function resetCardInputScreen() {
	//Increment card number
	document.getElementById("cardInputNumber").innerHTML = "Card " + ++cardNum;
	//Clear input box
	document.getElementById("cardInbox").value = "";
}

//When user clicks Finish, the array of new user cards will send to server and call initGame()
var emitNewCards = function() {
	console.log("Sending cards to server. ");
	socket.emit("newUserCards",cardsToAdd);

	let html = ('<button id="send_cards" class="button" onclick="emitNewCards()">Wait for other players</button><br>')		
	document.getElementById("send_cards").outerHTML = html;
}


/* --------------------------------------------Socket.IO code : Client Listens -----------------------------------------------------------------------------------*/

// Login Page
socket.on('Registration_Status', registrationStatus);
socket.on('Login_Status', loginStatus);

// Lobby Page
socket.on('Online_Players_List',onlinePlayersList);
socket.on('game_start', game_start);

// Game Page
socket.on('updatePlayersInGame', updatePlayersInGame);
socket.on('updateHand', updateHand);

socket.on('judge', judgeDisplay); // TODO
socket.on('judgingTime', judgingTime); // TODO

socket.on('cardPlayed', cardPlayed); // TODO

// Custom Cards
socket.on('customCards', customCards)
// Reset Button
socket.on('reset_current_game', reset_current_game);

/* -------------------------------------- Socket.IO code:  Socket functions  ------------------------------------- */

function registrationStatus(data) {
	alert(data);
	console.log('Received registration info: ' + data);
};

function loginStatus(data) {
	alert(data.message);
	console.log('Login Status: ' + data.message);
	if (data.success) {
		document.getElementById("Lobby").style.display = "block";
		document.getElementById("LoginForm").style.display = "none";

		// will also update the global user
		user['username'] = data.username;
		user['socket_id'] = socket.id;
		console.log("Succesful login: " + user['username'], user['socket_id']);
	}
};

function onlinePlayersList(data) {
	// Updates the players currently online: HTML template looks like this:
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
		// console.log("Current Players:", "SocketID: ", key, "UserName: ", data[key])

		k += ('<li>' +
			'<div class="media">' +
			'<div class="media-left align-self-center">' +
			'<img class="rounded-circle" src="/public/Player_Avatar.jpg">' +
			'</div>' +
			'<div class="media-body">');
		k += ('<h4>'+ data[key] + '</h4>');
		k += ('<p>SocketID: '+ key + '</p>');
		k += ('</div></div></li>');
	};
	k += '</ul>';
	document.getElementById('PlayerList').innerHTML = k;

	let num_g1 = ('<p id="num_players_g1">Current Players: ' + num_players_g1 + '</p>');
	document.getElementById("num_players_g1").innerHTML = num_g1;
};

function game_start(canStart, message) {
	if (canStart) {
		console.log(message);
		
		// Turn off lobby, login form, custm card div
		document.getElementById("Lobby").style.display = "none";
		document.getElementById("LoginForm").style.display = "none";
		document.getElementById("CustomCards").style.display = "none";
		
		// Turn on  Game div
		document.getElementById("Game").style.display = "block";
		document.getElementById("PlayerHand").style.display = "block";
		document.getElementById("usersInGame").style.display = "block";
	} else {
		alert(message);
	}
}

function updatePlayersInGame(playersList) {

	// Function to update the HTML 
	let k = ('<h3> Players In Game: </h3> ') ;
	
	for (let i = 0; i < playersList.length; i++) {
		
		if (playersList[i].judge) {
			
			k += '<font color="red">' 
			 	+ "Judge: " + playersList[i].username 
			 	+ '</font>';			
		} else {
			k += '<small> '
				+ playersList[i].username
				+ '</small>'
		};
	};

	document.getElementById('usersInGame').innerHTML = k;
};

function updateHand(new_hand) {
	// update client's hand with the new array of the hand
	console.log("updating hand");
	
	let k = ('<h3> Current Hand: Click a card to play </h3>');
	for (let i = 0; i < new_hand.length; i++) {
		k += '<button id="card-CSS" onclick="sendCard(' + i + ')"> ' + new_hand[i].value + ' </button>"'
	};

	document.getElementById('PlayerHand').innerHTML = k;
};

// TODO
function judgeDisplay(judge_hand) {
	console.log(" You are judge! ");
	document.getElementById('PlayerHand').style.display = "none"; // instead of hiding display, we can just disable buttons
	document.getElementById('JudgeSelect').style.display = "block";
};

// TODO
function judgingTime(judge_hand, judge) {
	console.log( " Console has received the cards to judge: " + judge_hand);

	let k = "";


	if (user.username === judge.username) {
		k += ('<h3> Pick your favourite card for this round! </h3> ');
	} else { 
		k +=  ('<h3> Judge ' + judge.username + ' is currently deciding');
	}

	// display the cards
	for (let i = 0; i < judge_hand.length; i++) {
		k += '<button id="card-CSS" onclick="sendCard(' + i + ')"> ' + judge_hand[i].value + ' </button>"'
	};

	document.getElementById('judgeSelect').innerHTML = k;
};

// TODO
function cardPlayed(data) {
	// Card was played by a player to add to the pile to judge
	console.log("Receiving a card being played from: " + data.username);
	let cardid = data.cardid;
};

function customCards(status, message) {
	if (status) {
		console.log(message);
 		// Go to custom card screen.
		document.getElementById("Lobby").style.display = "none";
		document.getElementById("LoginForm").style.display = "none";
		document.getElementById("CustomCards").style.display = "block";
	} else {
		console.log('error not received.');
	}
};

// Resetting Game - Moving Everyone Back to Lobby and Resetting Game
function reset_current_game(user) {

	console.log("Resetting Game");
	alert('Game Reset Initialized by User: ' + user);
 	// Turn on lobby div
	document.getElementById("Lobby").style.display = "block";
	
	// Turn off  Game div
	document.getElementById("Game").style.display = "none";
	document.getElementById("PlayerHand").style.display = "none";
	document.getElementById("usersInGame").style.display = "none";
};

