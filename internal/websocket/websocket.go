package websocket

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/svrem/quizzy/internal/db"
	"github.com/svrem/quizzy/internal/middleware"
)

func handlePoW(challengeToken string, nonceStr string) bool {
	if os.Getenv("DISABLE_POW") == "true" {
		return true // PoW is disabled, allow all connections
	}

	if challengeToken == "" || nonceStr == "" {
		return false
	}

	// Convert nonce to int64
	nonce, err := strconv.ParseInt(nonceStr, 10, 64)
	if err != nil {
		return false
	}

	return verifyChallenge(challengeToken, nonce)
}

// serveWs handles websocket requests from the peer.
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {

	challengeToken := r.URL.Query().Get("challenge_token")
	nonceStr := r.URL.Query().Get("nonce")
	if !handlePoW(challengeToken, nonceStr) {
		http.Error(w, "Invalid challenge or nonce", http.StatusForbidden)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	user, ok := r.Context().Value(middleware.UserContextKey).(*db.User)
	if !ok || user == nil {
		user = &db.User{
			Streak: 0,
			Score:  0,
		}
	}

	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256), selectedAnswer: -1, selectedCategory: -1, user: user}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
