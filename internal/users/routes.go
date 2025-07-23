package users

import (
	"net/http"

	"github.com/svrem/quizzy/internal/middleware"
)

func RegisterRoutes(router *http.ServeMux) {
	router.Handle("/api/user/details", middleware.AuthMiddleware(http.HandlerFunc(GetUserDetailsHandler)))
}
