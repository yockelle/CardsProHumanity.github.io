"use strict"

/* -------- Global Variables for the client  ----------- */
var socket = io();

var client = {
	username: "null",
	socket_id: "null",
}


/* --------------------------------------- Button-click functions  ------------------------------------------------- */
// We could make a seperate file for this called button.js and pass in socket as a paramater
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
	
	console.log('Sending user login info to server');
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

function sendCard(card_idx, option) { 
	/* Emited upon clicking any card - either as an answer (from the candidates) or as a winner (selected by Judge).
	 * Paramters:
	 card_idx (int) value between 0 - 5 (or the length of their hand) signifying the index of the card
	 option (string) either 'candidate' or 'judge'
	 * Emits:
	  Emits to the server the card_idx, and option as 'cardPlayed'
	*/

	var data = {
		card_idx: card_idx,
		username: client.username, // username will keep track of who sent the card 
		socket_id: client.socket_id
	}

	console.log('Sending the card ' + data.card_idx + ' to Server from ' + data.username, data.socket_id);

	socket.emit('cardPlayed', data, option);
	
}
function resetGame() {
	// Emited on 'Reset' button click
	console.log("Resetting Game Button Pressed. Sending Request to Server");
	socket.emit('ResetGameButtonPressed') //sending request to server to reset game
}

function pingServer() {
	/* Debugging button to ping the server with the socket's ID */
	socket.emit('pingServer', socket.id);
}

/* ------------------------------------ Card Creation Functions ------------------------------------ */
var cardNum = 1; // Keeps track of new cards entered by user
var cardsToAdd = []; // Array to hold new cards user enters

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
socket.on('Disconnected_Player', disconnectedPlayer);

// Lobby Page
socket.on('Online_Players_List', onlinePlayersList);
socket.on('game_start', game_start);

// Game Page - HTML updates
socket.on('updateBanner', updateBanner);
socket.on('updateHand', updateHand); // calls updateHand with clickable = true
socket.on('updatePrompt', updatePrompt);


// Judge Rotation Display Toggling
socket.on('startJudgeRound', startJudgeRound);
socket.on('endJudgeRound', endJudgeRound); 

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

		// will also update the global client
		client['username'] = data.username;
		client['socket_id'] = socket.id;
		console.log("Succesful login: " + client['username'], client['socket_id']);
	}
};

function disconnectedPlayer(){
	/* Creates a 'Continue' button for the disconnected player */
	let html = ('<a id="join_g1" href="#" class="btn btn-default" onclick="continueGame()">Continue</a>');
	document.getElementById("join_g1").innerHTML = html;
	document.getElementById("start_g1").style.display = "none";
}


function onlinePlayersList(data, num_players_g1) {
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
	for (let key in data) {
		// console.log("Current Players:", "SocketID: ", key, "UserName: ", data[key])

		k += ('<li>' +
			'<div class="media">' +
			'<div class="media-left align-self-center">' +
			'<img class="rounded-circle" src="/public/Player_Avatar.jpg">' +
			'</div>' +
			'<div class="media-body">');
		k += ('<h4>'+ data[key] + '</h4>');
		k += ('<p>SocketID: '+ key + '</p>'); // orig <p> and </p>
		k += ('</div></div></li>');
	};
	k += '</ul>';
	document.getElementById('PlayerList').innerHTML = k;

	let num_g1 = ('<p id="num_players_g1">Current Players: ' + num_players_g1 + '</p>');
	document.getElementById("num_players_g1").innerHTML = num_g1;
};

function game_start(canStart, message, playersList, scores) {
	/* Starts the Game. Called when the server gives an OK to start the game

	Parameters
	canStart (boolean) true/false if we can start, otherwise do something
	message (string) message to print out
	playersList ( list of the entire playerObject)
	scores (hash set of the scores (from a game.scores attribute))

	This function will also call to start off:
	
	*/

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

function updateGameStyling(playerIsJudge) {

	//customize players view depending if they are judge vs reg player
	if (playerIsJudge) {
		document.getElementById('Status').innerHTML = `<h1>Judge</h1>`;
		document.getElementById("Game").style.backgroundColor = "black";
		document.getElementById("Game").getElementsByClassName("container")[0].style.backgroundColor = "black";
		document.body.style.backgroundColor = "black";
		document.documentElement.style.backgroundColor = "black";

	} else {
		document.getElementById('Status').innerHTML = `<h1>Basic</h1>`;
		document.getElementById("Game").style.backgroundColor = "#2e2c2c";
		document.getElementById("Game").getElementsByClassName("container")[0].style.backgroundColor = "#2e2c2c";
		document.body.style.backgroundColor = "#2e2c2c";
		document.documentElement.style.backgroundColor = "#2e2c2c";
	}

}


function startTimer() {
	var seconds = 30;
	var timer = document.getElementById('Timer');
	//reset to 30
	timer.innerHTML = `<h1>30</h1>`;

	//every second, decrease by 1 and reset html
	let countdown = setInterval(function() {
		console.log(seconds);
		seconds--;
		if (seconds >= 0) {
			timer.innerHTML = `<h1>${seconds}</h1>`
		}
		else {
			clearInterval(countdown);

			//create function to do something once seconds reaches zero.
			//possibably randomly plays a card if player not judge
			//possibably randomly select a card if player is judge
		}
	}, 1000);

}
function updateBanner(playersList, scores) {
	
	/* Function called at the end of every round  

	Updates the Banner screen on client:
	The Rounds, Timer, Status, Player, and Players columns
	
	Parameters:
	playersList (array of PlayerObjects)
	scores (hash of {user (string) : score }) */

	console.log("Updating the banner for the client");
	
	//Start Timer:
	startTimer();

	//<div class="col-sm"><h1>5</h1></div>
/* 	let k = ('<div class="col-sm"><h3>') ;
	
	// Status Column -> either 'Judge or basic'	
	for (let i = 0; i< playersList.length; i++) {
		
		let PlayerObject = playersList[i];

		if (PlayerObject['username'] == client['username']) { // found the PlayerObject for username
			
			let status = (PlayerObject['judge'] ? "Judge" : "basic") // Judge if true, basic is false
			
			//document.getElementById('Status').innerHTML = `<h1> ${status} </h1>`;
			
			// if (PlayerObject['judge']) {
			// 	// This actually doesn't work, how to change the background of the judge to black?
			// 	updateGameStyling(true)
			// }
			// break;
		}
	} */

	// Player Column
	document.getElementById('currentUser').innerHTML = `<h1> ${client['username']} </h1>`;


	// Modifying the Player List column with scores
	let k = ('<div class="col-sm"><h3>') ;
	for (let i = 0; i < playersList.length; i++) {
		
		let player = playersList[i];
		let username = player.username;

		if(player.username === client.username) {
			//customize players view depending if they are judge vs reg player
			updateGameStyling(player.judge);
		}

		if (player.judge) {
				k += '<font color="red">' 
				+ '<small>'
			 	+ "Judge: " + username + " { " + scores[username] + " } "
				+ '</small>'
				+'</font><br>';			
		} else {
			k += '<small> '
				+ player.username + " { " + scores[username] + " } ";
				+ '</small><br>'
		};
	};

	k += '</h1></div>';

	document.getElementById('usersInGame').innerHTML = k;
};

function updateHand(new_hand, isjudge) {
	/* update client's hand with the new array of the hand
	Parameter:
	new_hand : Array of card object
	clickable : boolean - whether or not you want the cards to be clickable
	*/
	console.log("updating hand");

	let handhtml = `<div class="row"><div class="card-deck">`; // Parent Div


	// Produce the cards
	for (let i = 0; i < new_hand.length; i++) {
	
		//if player is judge, then they dont get button to send card. 
		if (isjudge) {
			handhtml += ('<div class="card">' + 
			'<div class="card-body">' +
			   `<h5 class="card-title">${new_hand[i].value}</h5>` +
			`</div>` +
		   `</div>`);
		}

		//if player is not judge then they get button to send card
		else {
			handhtml += (`<div class="card">`+ 
			`<div class="card-body">`+
			   `<h5 class="card-title">${new_hand[i].value}</h5>`+
			   `<button id="cardbutton" onclick="sendCard(${i}, 'candidate')"> submit </button>`+
			`</div>`+
		   `</div>`);
		}
		if (i==2) {
			handhtml += `<div class="w-100"></div>`; // add spacing after the third card
		}
	};

	handhtml += `</div></div>`; // Close Parent Div

	
	document.getElementById('PlayerHand').innerHTML = handhtml;
};

function updatePrompt(prompt_msg) {
	// update the prompt card with the prompt msg (just a string)
	console.log(`updating the prompt ${prompt_msg}`);

	let promptHTML = `<div class="col-lg-3 col-sm-5 col-xs-6">`+
						 `<div class="card text-white bg-dark">`+
						 	`<div class="card-body">`+
						  		`<h5 class="card-title"> ${prompt_msg} </h5>`+
						  	`</div>`+
						  `</div>`+
						`</div>`

	document.getElementById('PromptCard').innerHTML = promptHTML;
}

function startJudgeRound(judge_hand, judge) {
	/* Function for socket.on('startJudgeRound')
	 * Parameters:
		judge_hand (array of Card objects) - in the order that they were pushed
		judge (Player object) - the judge player 
	 * Updates the HTML :
	  1) Players don't see their hands anymore, and only see what the Judge must select
	  2) If the client is a judge, make the cards be displayed with buttons
	  3) If the client is not a judge, make the cards be displaeyd without buttons
	  4) change the HTML

	 */
	
	console.log("Received from startJudgeRound:" + judge_hand);

	// 1) Hide their hands, display the Judge's possible selections
	document.getElementById('PlayerHand').style.display = "none"; 
	document.getElementById('JudgeSelect').style.display = "block";
	

	let html;
	let clientIsJudge = (client['username'] === judge.username);
	
	// 2) Client is a judge - the caards displayed can be clicked
	if (clientIsJudge) { 
		
		html = '<div class="row"><div class="col text-white"><h5>Pick the winner:</h5></div></div>'
		html += '<div class="row"><div class="card-deck">'  // parent div

		for (let i = 0; i < judge_hand.length; i++) {

			let args = `${i},'winner'`; // sendCard(i , 'winner') 
			
			html += `<div class="card bg-light">
	            		<div class="card-body">
	              			<h5 class="card-title"> ${judge_hand[i]['value']} </h5>
	              			<button id="cardbutton" onclick="sendCard(${args})"> This is the best one </button>
	            		</div>
	          		</div>` 
		}

		html += `</div></div>` // closing parent div

	// 3) client isn't a judge - the card displayed cannot be clicked
	} else { // if client is NOT judge, display the cards without button click
		
		html = '<div class="row"><div class="col text-white"><h5>Judge<span style="color:#0000FF;"> ' + judge.username + ' </span>is currently deciding:</h5></div></div>'
		html += '<div class="row"><div class="card-deck">'  // parent div

		for (let i = 0; i < judge_hand.length; i++) {

			let args = `${i},'winner'`; // sendCard(i , 'winner') 
			
			html += `<div class="card bg-light">
	            		<div class="card-body">
	              			<h5 class="card-title"> ${judge_hand[i]['value']} </h5>
	            		</div>
	          		</div>` 
		}

		html += `</div></div>` // closing parent div
	};

	// 4)
	document.getElementById('JudgeSelect').innerHTML = html;
};


function endJudgeRound(old_judge, new_judge, new_prompt, playersList, scores, winner) {
	/* ends the current round. 
	 * Parameters:
	  old_judge (Player object)
	  new_judge (Player object)
	  new_prompt (Card object)
	  playersList (array of Player objects)
	  scores (hashmap. {username (string) : score (int) } )
	  winner (JSON object with { user (String) , completed_text (string)} )
		
	  * HTML changes
	  1) Alerts everyone the winner of that round + the completed text (combined prompt + answer)
	  2) 
	  3) Alerts the old judge and new judge, and fix their HTML accordingly
	  
	*/
	console.log("judge round ended: Client is: ",  client['username'], ` old: ${old_judge.username}, new: ${new_judge.username}`);
	
	let winning_user = winner['user'];
	let completed_text = winner['completed_text'];

	// 1) Update with New Prompt
	updatePrompt(new_prompt);

	// 2) Alert old and new judge Rotate to the next Judge
	if (client['username'] == old_judge.username) {
		
		alert(" You are no longer judge, this round you pick a card! ")
		
		document.getElementById('JudgeSelect').style.display = "none";
		document.getElementById('PlayerHand').style.display = "block"; 

	}
	else if (client['username'] == new_judge.username) {
		
		alert(`${winning_user} has won the round! ${completed_text}`);

		alert(" You are now the judge for the next round! ")

		document.getElementById('PlayerHand').style.display = "none";
		document.getElementById('JudgeSelect').innerHTML = "<h2> Players are still deciding... </h2>"
	
	} else { //every other player (that wasn't a judge or isn't a judge)
		alert(`${winning_user} has won the round! ${completed_text}`);
		document.getElementById('JudgeSelect').style.display = "none";
	}

	// Update the Banner HTML on top of the screen
	updateBanner(playersList, scores);

	//Update Hand (Find Current Player in PlayerList. Send new Hand to function to re-render)
	for (let i = 0; i < playersList.length; i++) {
		
		let player = playersList[i];
		let isjudge = player.judge;
		let hand = player.hand

		if(player.username === client.username) {
			updateHand(hand, isjudge)
			break;
		}
	}


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

	// Reset Custom Card Page:
	let html = `<div id="CustomCards">` +
	`<p>First things first, add your personalized cards. These could be the names of the players, some places in your local area, or things or people that feature in your "in" jokes. Remember, they need to be people or things (tangible or abstract) and you can add up to 20. Add your first one below followed by Add New Card and click Finished when you've entered your last.</p>` +
	`<span id="cardInputNumber">Card 1: </span><input type="text" id="cardInbox"><br>` +
	`<button class="button" onclick="addNewCardButton()">Add New Card</button><br>` +
	`<div id="displayCardsEntered"></div><br>` + 
	`<button id="send_cards" class="button" onclick="emitNewCards()">Finished</button><br>` +
	`</div>`
	document.getElementById("CustomCards").outerHTML = html;

	//reset background color:
	document.body.style.backgroundColor = "white";
	document.documentElement.style.backgroundColor = "white";
};
