package auth

import "net/http"

func RegisterRoutes(router *http.ServeMux) {
	router.HandleFunc("/auth/login/google", RedirectToGoogleAuthCodeURL)
	router.HandleFunc("/auth/callback/google", HandleGoogleOAuthCallback)

	router.HandleFunc("/auth/login/discord", RedirectToDiscordAuthCodeURL)
	router.HandleFunc("/auth/callback/discord", HandleDiscordOAuthCallback)

	router.HandleFunc("/auth/user", GetUserFromTokenHandler)
	router.HandleFunc("/auth/logout", LogoutHandler)

	router.HandleFunc("/api/user/details", GetUserDetailsHandler)
}
