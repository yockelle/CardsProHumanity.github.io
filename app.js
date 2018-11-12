/* Setting up the Express Server */
var express = require('express'); 
//Call express()
var app = express();
//set up serer
var server = require('http').Server(app);
//app will get starting file from client folder
app.get('/',function(req,res) {
    res.sendFile(__dirname + '/client/index.html');
});
//app will use /client
app.use('/client',express.static(__dirname + '/client/'));
//server will listen to request on port 200
server.listen(2000);
console.log("Server Started on Port 2000");



/* Setting up variables */
let AllPlayers = {value: 'test'} //Keep track of all players

let promptCards = ['Daddy why is mommy crying?', 'What does Dick Cheney prefer?','I drink to forget __']
let playerCards = ['Drinking alone','The glass ceiling,','A PowerPoint presentation'];

function getRandomPlayerCard(playerCards) {
    return playerCards[Math.floor(Math.random()*playerCards.length)];
}

//Bring in socket.io
var io = require('socket.io')(server,{});

/* Socket.io Logic. For Each Connection: */
//handles one instance of a connection from a client
io.sockets.on('connect', function(socket) {

    /* Setting up variables */
    let debugPlayer = {value: 'test'}

    //Everytime a client connections, print to console
    console.log(socket.id + ' socket connected');

    //add data to debug json
    debugPlayer['Connection'] = socket.id;
    //add data to All Players
    AllPlayers[socket.id] = {
        'socket.id': socket.id,
        'Connection': "Connected",
        'PlayerData': {
            'numOfCards': 0,
            'name' : "joe",
            'cards' : {
            }
        }
    }
    //fires when player presses the debug player button
    socket.on('debugPlayerButton', function() {
        //sends the debug player object to the client 
        socket.emit('DEBUG_PLAYER', debugPlayer);
    })

    //fires when player presses the debug ALL player button
    socket.on('debugALLPlayerButton', function() {
        //sends the debug player object to the client 
        socket.emit('DEBUG_ALL_PLAYER', AllPlayers);
    })

    //fires when player presses the GetCardsButton
    socket.on('getCardsButton', function() {
        //sends a random Cards to the client if Cards is less then 5
        let numOfCards = AllPlayers[socket.id]['PlayerData']['numOfCards'];

        if (numOfCards < 5) {
            let card = getRandomPlayerCard(playerCards)
            socket.emit('PLAYER_CARD', card);    
            AllPlayers[socket.id]['PlayerData']['cards'][numOfCards] = card;
            AllPlayers[socket.id]['PlayerData']['numOfCards']++;   
        }
    })
})


