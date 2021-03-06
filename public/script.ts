const canvas : any = <HTMLCanvasElement> document.querySelector("#playground");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext("2d");
 
let deltaX = 0;
let deltaY = 0;

let keys = [];
let thisPlayer = {
  x: Math.floor(Math.random() * 1000),
  y: Math.floor(Math.random() * 1000),
  id: undefined
}

const socket = new WebSocket("ws://127.0.0.1:8080/ws");

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
 
const increment = 8;
function keysPressed(e) {
  clearPlayer(thisPlayer);

  // Store entry for every key pressed
  keys[e.keyCode] = true;

  // Left
  if (keys[37]) {
    thisPlayer.x -= increment;
  }

  // Right
  if (keys[39]) {
    thisPlayer.x += increment;
  }

  // Down
  if (keys[38]) {
    thisPlayer.y -= increment;
  }

  // Up
  if (keys[40]) {
    thisPlayer.y += increment;
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

  let players = JSON.parse(event.data);
  players = JSON.parse(players)
  console.log(players)
  console.log("GOING TO FOR EACH")
  console.log(players[0])
  for (let player of players) {
    console.log("THIS PLAYER")
    console.log(player)
    
    if (player.self) {
      thisPlayer.id = player.id;
    } else {
      clearPlayer(player)
      drawPlayer(player)
    }
  }
};