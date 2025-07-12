package websocket

import (
	"crypto/sha512"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func verifyChallenge(challengeToken string, nonce int64) bool {

	// Get the secret key from environment variable
	secretKey := os.Getenv("SECRET_KEY")
	if secretKey == "" {
		return false
	}

	// Parse and validate the JWT challenge token
	token, err := jwt.Parse(challengeToken, func(token *jwt.Token) (interface{}, error) {
		// Verify the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	if err != nil || !token.Valid {
		return false
	}

	// Extract the challenge code from the token claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return false
	}

	challengeCode, ok := claims["challenge"].(string)
	if !ok {
		return false
	}

	// Verify the proof of work
	// Combine challenge code with nonce and hash with SHA-512
	input := challengeCode + strconv.FormatInt(nonce, 10)
	hash := sha512.Sum512([]byte(input))
	hashHex := fmt.Sprintf("%x", hash)

	// Check if the hash starts with required number of zeros (difficulty: 4 zeros)
	return strings.HasPrefix(hashHex, "000")
}
