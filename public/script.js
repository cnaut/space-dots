
var canvas = document.querySelector("#playground");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext("2d");
 
var deltaX = 0;
var deltaY = 0;

function drawShip() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Ship
  context.beginPath();
  context.moveTo(200 + deltaX, 100 + deltaY);
  context.lineTo(170 + deltaX, 150 + deltaY);
  context.lineTo(230 + deltaX, 150 + deltaY);
  context.closePath();

  socket.send('{ "X": ' + deltaX + ', "Y": ' + deltaY + '}');
  
  context.fill();
}
 
function keysPressed(e) {
  // Store entry for every key pressed
  keys[e.keyCode] = true;

  // Left
  if (keys[37]) {
    deltaX -= 2;
  }

  // Right
  if (keys[39]) {
    deltaX += 2;
  }

  // Down
  if (keys[38]) {
    deltaY -= 2;
  }

  // Up
  if (keys[40]) {
    deltaY += 2;
  }

  e.preventDefault();

  drawShip();
}
 
function keysReleased(e) {
  // Mark keys that were released
  keys[e.keyCode] = false;
}

window.addEventListener("keydown", keysPressed, false);
window.addEventListener("keyup", keysReleased, false);
 
var keys = [];

var socket = new WebSocket("ws://127.0.0.1:8080/ws");
console.log("Attempting Connection...");

socket.onopen = () => {
  console.log("Successfully Connected");
  drawShip();
};

socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!")
};

socket.onerror = error => {
  console.log("Socket Error: ", error);
};

socket.onmessage = function (event) {
  console.log(event.data);
};