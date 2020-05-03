package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var numPlayers = 0
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Player)
var players = make(map[int]Player)

type Player struct {
	ID   int  `json:"id"`
	X    int  `json:"x"`
	Y    int  `json:"y"`
	Self bool `json:"self"`
}

func home(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// Define a reader which will listen for new messages being sent to our WebSocket endpoint
func reader(conn *websocket.Conn) {
	for {
		// Read in a message
		log.Println("MESSAGE")
		log.Println(conn)
		var player Player
		err := conn.ReadJSON(&player)
		log.Println(err)
		if err != nil {
			log.Println(err)
			delete(clients, conn)
			return
		}

		log.Printf("%d", player.X)
		log.Printf("%d", player.Y)

		broadcast <- player
	}
}

func wsEndpoint(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	// Upgrade this connection to a WebSocket connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}

	log.Println("Client Connected")
	player := Player{numPlayers, 0, 0, true}
	players[numPlayers] = player
	numPlayers++

	playersJSON, err := json.Marshal(players)
	if err != nil {
		log.Println(err)
	}

	err = ws.WriteJSON(string(playersJSON))
	if err != nil {
		log.Println(err)
	}

	player.Self = false

	clients[ws] = true

	reader(ws)

	//defer ws.Close()
}

func setupRoutes() {
	http.HandleFunc("/", home)
	http.HandleFunc("/ws", wsEndpoint)

	http.Handle("/public/", http.StripPrefix(strings.TrimRight("/public/", "/"), http.FileServer(http.Dir("./public"))))
}

func handleActions() {
	log.Println("Handling Actions")
	for {
		log.Println("ACTION")
		player := <-broadcast
		log.Println("Looping")
		for client := range clients {
			log.Printf("Client")
			err := client.WriteJSON(player)
			if err != nil {
				log.Println(err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}

func main() {
	fmt.Println("Space dots")

	setupRoutes()

	go handleActions()

	log.Fatal(http.ListenAndServe(":8080", nil))
}
