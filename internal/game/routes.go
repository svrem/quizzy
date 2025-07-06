package game

import (
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/svrem/quizzy/internal/utils"
)

func RegisterRoutes(router *http.ServeMux) {
	router.HandleFunc("/api/challenge", HandleNewChallengeCode)
}

type SessionCodeClaims struct {
	Challenge string `json:"challenge"`
	jwt.RegisteredClaims
}

func HandleNewChallengeCode(w http.ResponseWriter, r *http.Request) {
	state := utils.GenerateRandomCode()

	secretKey := os.Getenv("SECRET_KEY")
	if secretKey == "" {
		http.Error(w, "SECRET_KEY environment variable is not set", http.StatusInternalServerError)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, SessionCodeClaims{
		Challenge: state,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "quizzy",
			Audience:  []string{"quizzy"},
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	})

	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"code": "` + state + `", "token": "` + tokenString + `"}`))

}
