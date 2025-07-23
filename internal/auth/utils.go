package auth

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/svrem/quizzy/internal/utils"
)

func generateState() string {
	return utils.GenerateRandomCode()
}

func SignToken(token *jwt.Token) (string, error) {
	return token.SignedString([]byte(secretKey))
}
