/*
// Client side's public board

See this for all the mouse actions we can override
https://github.com/processing/p5.js/wiki/p5.js-overview#mouse-and-touch-interaction
-Orlando

I marked all the functions that are just p5 library function with @p5

*/

//var socket = io(); 
//socket.on('mouseMove', newDrawing);

var socket;


//@p5
function setup() {

	// TODO: I think this should scale with the browser
	createCanvas(800, 800); 
	background(51);

	// Connect the client to the server
	socket = io();

	// The board must also receive data from the server
	socket.on('mouseMove', newDrawing);
}

function newDrawing(data) {
	//function to update their instance of public board
	// based on data
	fill(200,200, 10); // using a different RGB to know its coming from
	// the outside

	ellipse(data.x, data.y, 50, 50);
}


//@p5
function mouseDragged() {

	// Function for clicking and dragging
	
	var mouseData = {
		x: mouseX,
		y: mouseY
	}
	
	console.log('Sending mouseDragged: ' + mouseData.x + ',' +  mouseData.y);
	
	
	noStroke();
	fill(255);
	ellipse (mouseX, mouseY, 50, 50);

	socket.emit('mouseMove',  mouseData);

}
