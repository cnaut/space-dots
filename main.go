package main

import (
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

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Player)

type Player struct {
	X int `json:"x"`
	Y int `json:"y"`
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
		var player Player
		err := conn.ReadJSON(&player)
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
	if err != nil {
		log.Println(err)
	}

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
