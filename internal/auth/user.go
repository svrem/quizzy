package auth

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/svrem/quizzy/internal/db"
)

type UserTokenClaims struct {
	Sub string `json:"sub"`
	jwt.RegisteredClaims
}

func generateBearerToken(user *db.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, UserTokenClaims{
		Sub: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "quizzy",
			Audience:  []string{"quizzy"},
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	})

	tokenString, err := SignToken(token)
	if err != nil {
		return "", err
	}

	return tokenString, nil

}

func generateUserToken(user db.User, provider string, providerID string) (string, error) {
	existingUser := db.GetUserByProviderAndID(provider, providerID)

	if existingUser != nil {
		log.Println("User already exists, generating token for existing user")
		return generateBearerToken(existingUser)
	}

	emailUser := db.GetUserByEmail(user.Email)

	if emailUser != nil {
		user = *emailUser
	} else {
		if err := db.CreateUser(&user); err != nil {
			return "", err
		}
	}

	userOAuth := db.UserOAuth{
		UserID:     user.ID,
		Provider:   provider,
		ProviderID: providerID,
	}

	if err := db.CreateUserOAuth(&userOAuth); err != nil {
		return "", err
	}

	return generateBearerToken(&user)
}

func GetUserFromToken(tokenString string) (*db.User, error) {
	token, err := jwt.ParseWithClaims(tokenString, &UserTokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*UserTokenClaims); ok && token.Valid {
		user := db.GetUserByID(claims.Sub)
		if user == nil {
			return nil, errors.New("user not found")
		}
		return user, nil
	}

	return nil, errors.New("invalid token")
}

func GetUserFromTokenHandler(res http.ResponseWriter, req *http.Request) {
	tokenCookie, err := req.Cookie("token")
	if err != nil {
		http.Error(res, "Token cookie not found", http.StatusUnauthorized)
		return
	}

	user, err := GetUserFromToken(tokenCookie.Value)
	if err != nil {
		http.Error(res, "Invalid token: "+err.Error(), http.StatusUnauthorized)
		return
	}

	res.Header().Set("Content-Type", "application/json")
	res.WriteHeader(http.StatusOK)

	response := map[string]string{
		"id":              user.ID,
		"email":           user.Email,
		"username":        user.Username,
		"profile_picture": user.ProfilePicture,
		"streak":          strconv.Itoa(user.Streak),
		"score":           strconv.Itoa(user.Score),
		"max_streak":      strconv.Itoa(user.MaxStreak),
	}
	if err := json.NewEncoder(res).Encode(response); err != nil {
		http.Error(res, "Failed to encode response: "+err.Error(), http.StatusInternalServerError)
		return
	}
}

func LogoutHandler(res http.ResponseWriter, req *http.Request) {
	// Clear the token cookie by setting its expiry to a past time
	http.SetCookie(res, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Now().Add(-1 * time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		Secure:   req.TLS != nil,
	})

	http.Redirect(res, req, "/", http.StatusSeeOther)
}
