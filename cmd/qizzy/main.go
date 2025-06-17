package main

import (
	"log"
	"net/http"

	"github.com/svrem/qizzy/internal/routes"
	"github.com/svrem/qizzy/internal/websocket"
)

func main() {
	router := routes.NewRouter()

	hub := websocket.NewHub()
	go hub.Run()

	router.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(hub, w, r)
	})

	println("Starting server on :8080")
	// Start the server
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
