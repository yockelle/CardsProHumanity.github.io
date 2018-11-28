/* -------------
Client side JS file

 -----------------*/

// initialize socket connection. Should only do this once
var socket = io();

// Store username & socketid client side 
var user = {
	username: "null",
	socket_id: "null"
}

/* ---------- User Registration ---------- */
function userRegister() {
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
} // end of userRegister

// Registration Listen
socket.on('Registration_Status', function (data) {
	alert(data);
	console.log('Received' + data);
});

// Online_Players_list Listen
socket.on('Online_Players_List', function (data, num_players_g1) {

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
		k += ('<h4>'+ data[key] + '</h4>');
		k += ('<p>SocketID: '+ key + '</p>');
		k += ('</div></div></li>');
	};
	k += '</ul>';
	document.getElementById('PlayerList').innerHTML = k;

	let num_g1 = ('<p id="num_players_g1">Current Players: ' + num_players_g1 + '</p>');
	document.getElementById("num_players_g1").innerHTML = num_g1;
});

socket.on('Disconnected_Player', function() {
		let html = ('<a id="join_g1" href="#" class="btn btn-default" onclick="continueGame()">Continue</a>');
		document.getElementById("join_g1").innerHTML = html;
		document.getElementById("start_g1").style.display = "none";
})

/* ----------- User Login ----------- */
function userLogin() {
	
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
}

// Login Status listen
socket.on('Login_Status', function (data) {
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
});

/* ---------- Game Start --------- */
function joinGameOne() {
	socket.emit("joinGameOne");
}

function initGame() {
	// Emitted upon 'Start' button click
	socket.emit("initGame", true);
}

function continueGame() {
	socket.emit("continueGame");
}

// game start listening - hiding appropriate divs
socket.on('game_start', function (playerHands, message) {
	if (playerHands) {
		console.log(message);
		
		// Turn off lobby and login form div
		document.getElementById("Lobby").style.display = "none";
		document.getElementById("LoginForm").style.display = "none";
		
		// Turn on  Game div
		document.getElementById("Game").style.display = "block";
		document.getElementById("PlayerHand").style.display = "block";
		document.getElementById("usersInGame").style.display = "block";
	} else {
		alert(message);
	}
});


/* ----------- GAME LOGIC functions ----------- */

/* ----- HTML updating ----- */ 
socket.on('updatePlayersInGame', updatePlayersInGame)

function updatePlayersInGame(playersList) {

	// Function to update the HTML 
	let k = ('<h3> Players In Game: </h3> ') ;
	
	for (let i = 0; i < playersList.length; i++) {
		
		if (playersList[i].judge) {
			
			k += '<font color="red">' 
			 	+ playersList[i].username 
			 	+ '</font>';			
		} else {
			k += '<small> '
				+ playersList[i].username
				+ '</small>'
		};
	};

	document.getElementById('usersInGame').innerHTML = k;
};

/* ----- Player Hand ----- */
socket.on('updateHand', function updateHand(new_hand) {
	console.log("updating hand");
	
	let k = ('<h3> Current Hand: Click a card to play </h3>');
	for (let i = 0; i < new_hand.length; i++) {
		k += '<button id="card-CSS" onclick="sendCard(' + i + ')"> ' + new_hand[i].id + ' </button>"'
	};

	document.getElementById('PlayerHand').innerHTML = k;
});

/* ----- Judge Hand ------ */
socket.on('judge', function judgemode(judge_hand) {
	console.log(" You are judge! ");
	document.getElementById('PlayerHand').style.display = "none"; // instead of hiding display, we can just disable buttons
	document.getElementById('JudgeSelect').style.display = "block";

});

/* ------ Card Played ----- */ 
socket.on('cardPlayed', function cardPlayed(data) {

	console.log("Received a card being played from: " + data.username);

	let cardid = data.cardid;
	


});

function sendCard(card_idx) {

	// Sends card_played

	var data = {
		card_idx: card_idx,
		username: user.username,
		socket_id: user.socket_id
	}

	console.log('Sending the card ' + data.card_id + ' to Server');
	socket.emit('cardPlayed', data);

}
