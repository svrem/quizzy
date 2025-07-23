package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"

	"github.com/svrem/quizzy/internal/db"
	"github.com/svrem/quizzy/internal/game"
	"github.com/svrem/quizzy/internal/middleware"
	"github.com/svrem/quizzy/internal/routes"
	"github.com/svrem/quizzy/internal/socket"
	"github.com/svrem/quizzy/internal/websocket"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: No .env file found, using default environment variables")
	}

	if err := db.InitializeDatabase(); err != nil {
		log.Fatal("Failed to initialize database: ", err)
		return
	}

	router := routes.NewRouter()

	currentGame := game.NewGame()
	go currentGame.Start()

	hub := websocket.NewHub(currentGame)
	go hub.Run()

	socketServer := socket.NewSocket(currentGame)
	go socketServer.Run()

	router.Handle("/ws", middleware.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(hub, w, r)
	})))

	println("Starting server on :8080")
	// Start the server
	if err := http.ListenAndServe(":8080", router); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
