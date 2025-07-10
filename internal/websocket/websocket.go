package websocket

import (
	"log"
	"net/http"
	"strconv"

	"github.com/svrem/quizzy/internal/auth"
	"github.com/svrem/quizzy/internal/db"
)

// serveWs handles websocket requests from the peer.
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	// Check for challenge token and nonce in query parameters
	challengeToken := r.URL.Query().Get("challenge_token")
	nonceStr := r.URL.Query().Get("nonce")

	if challengeToken == "" || nonceStr == "" {
		http.Error(w, "Challenge token and nonce are required", http.StatusBadRequest)
		return
	}

	// Convert nonce to int64
	nonce, err := strconv.ParseInt(nonceStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid nonce", http.StatusBadRequest)
		return
	}

	// Verify the challenge
	if !verifyChallenge(challengeToken, nonce) {
		http.Error(w, "Invalid challenge", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// get the user token from the cookie
	cookie, err := r.Cookie("token")
	var user *db.User = &db.User{
		Streak: 0,
		Score:  0,
	}
	if err == nil {
		userDB, err := auth.GetUserFromToken(cookie.Value)
		if err == nil {
			user = userDB
		}
		// ser.UserGameStatsID
	}

	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), selectedAnswer: -1, selectedCategory: -1, user: user}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
