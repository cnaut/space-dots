
var canvas = document.querySelector("#playground");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext("2d");
 
var deltaX = 0;
var deltaY = 0;

var keys = [];
var thisPlayer = {
  x: Math.floor(Math.random() * 1000),
  y: Math.floor(Math.random() * 1000)
}

var socket = new WebSocket("ws://127.0.0.1:8080/ws");

function clearPlayer(player) {
  context.clearRect(player.x - 2, player.y -2, 64, 54);
}

function drawPlayer(player) {
  console.log(player);
  // Ship
  context.beginPath();
  context.moveTo(30 + player.x, player.y);
  context.lineTo(player.x, 50 + player.y);
  context.lineTo(60 + player.x, 50 + player.y);
  context.closePath();
  
  context.fill();
}
 
function keysPressed(e, sendUpdate) {
  clearPlayer(thisPlayer);

  // Store entry for every key pressed
  keys[e.keyCode] = true;

  // Left
  if (keys[37]) {
    thisPlayer.x -= 2;
  }

  // Right
  if (keys[39]) {
    thisPlayer.x += 2;
  }

  // Down
  if (keys[38]) {
    thisPlayer.y -= 2;
  }

  // Up
  if (keys[40]) {
    thisPlayer.y += 2;
  }

  e.preventDefault();

  drawPlayer(thisPlayer);

  socket.send('{ "id": ' + thisPlayer.id + ', "x": ' + thisPlayer.x + ', "y": ' + thisPlayer.y + ' }');
}
 
function keysReleased(e) {
  // Mark keys that were released
  keys[e.keyCode] = false;
}

window.addEventListener("keydown", keysPressed, false);
window.addEventListener("keyup", keysReleased, false);
 
console.log("Attempting Connection...");

socket.onopen = () => {
  console.log("Successfully Connected");
  drawPlayer(thisPlayer);
};

socket.onclose = event => {
  console.log("Socket Closed Connection: ", event);
  socket.send("Client Closed!")
};

socket.onerror = error => {
  console.log("Socket Error: ", error);
};

socket.onmessage = function (event) {
  if (!event.data) {
    return;
  }

  console.log(event.data);

  var player = JSON.parse(event.data);
  if (player.self) {
    thisPlayer.id = player.id;
  } else {
    clearPlayer(player)
    drawPlayer(player)
  }
};