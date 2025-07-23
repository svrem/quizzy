package users

import (
	"encoding/json"
	"net/http"

	"github.com/svrem/quizzy/internal/db"
	"github.com/svrem/quizzy/internal/middleware"
)

func GetUserDetailsHandler(res http.ResponseWriter, req *http.Request) {
	user, ok := req.Context().Value(middleware.UserContextKey).(*db.User)

	if !ok || user == nil {
		http.Error(res, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ranking, err := db.GetUserRanking(user)
	if err != nil {
		http.Error(res, "Failed to get user ranking: "+err.Error(), http.StatusInternalServerError)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(http.StatusOK)

	response := map[string]int{
		"ranking": ranking,
		"level":   user.Score / 100,
	}
	if err := json.NewEncoder(res).Encode(response); err != nil {
		http.Error(res, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}
