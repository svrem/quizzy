package middleware

import (
	"context"
	"net/http"

	"github.com/svrem/quizzy/internal/auth"
)

type ContextKey string

const (
	UserContextKey ContextKey = "user"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenCookie, err := r.Cookie("token")
		if err != nil {
			next.ServeHTTP(w, r) // No token, proceed without user context
			return
		}

		user, err := auth.GetUserFromToken(tokenCookie.Value)
		if err != nil {
			next.ServeHTTP(w, r) // Invalid token, proceed without user context
			return
		}

		// Store user in context or pass it to the next handler
		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
