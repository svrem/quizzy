package auth

import "net/http"

func RegisterRoutes(router *http.ServeMux) {
	router.HandleFunc("/auth/login/google", RedirectToGoogleAuthCodeURL)
	router.HandleFunc("/auth/callback/google", HandleGoogleOAuthCallback)

	router.HandleFunc("/auth/user", GetUserFromTokenHandler)
	router.HandleFunc("/auth/logout", LogoutHandler)
}
