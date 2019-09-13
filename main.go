package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"strings"
)

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

func setupRoutes() {
	http.HandleFunc("/", home)

	http.Handle("/public/", http.StripPrefix(strings.TrimRight("/public/", "/"), http.FileServer(http.Dir("./public"))))

}

func main() {
	fmt.Println("Space dots")

	setupRoutes()

	log.Fatal(http.ListenAndServe(":8080", nil))
}
