package auth

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"os"

	"github.com/svrem/quizzy/internal/db"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

func initializeGoogleOAuthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		Scopes: []string{
			"profile",
			"email",
		},
		Endpoint: google.Endpoint,
	}
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	Picture       string `json:"picture"`
}

func fetchGoogleUserInfo(googleOauth2Conf *oauth2.Config, token *oauth2.Token) (*GoogleUserInfo, error) {

	oauthGoogleUrlAPI := "https://www.googleapis.com/oauth2/v2/userinfo?access_token="

	client := googleOauth2Conf.Client(context.Background(), token)
	response, err := client.Get(oauthGoogleUrlAPI + token.AccessToken)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	contents, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	var userInfo GoogleUserInfo
	if err := json.Unmarshal(contents, &userInfo); err != nil {
		return nil, err
	}

	if userInfo.ID == "" {
		return nil, errors.New("failed to get user info from Google")
	}

	if !userInfo.VerifiedEmail {
		return nil, errors.New("email not verified")
	}

	return &userInfo, nil
}

func RedirectToGoogleAuthCodeURL(res http.ResponseWriter, req *http.Request) {
	googleOauth2Conf := initializeGoogleOAuthConfig()
	state := generateState()

	stateCookie := http.Cookie{
		Name:     "google_oauth_state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		MaxAge:   60 * 10, // 10 minutes
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(res, &stateCookie)

	authURL := googleOauth2Conf.AuthCodeURL(state)
	http.Redirect(res, req, authURL, http.StatusFound)
}

func HandleGoogleOAuthCallback(res http.ResponseWriter, req *http.Request) {
	googleOauth2Conf := initializeGoogleOAuthConfig()

	stateCookie, err := req.Cookie("google_oauth_state")
	if err != nil {
		http.Error(res, "State cookie not found", http.StatusBadRequest)
		return
	}
	stateForm := req.FormValue("state")
	if stateCookie.Value != stateForm {
		http.Error(res, "Invalid state parameter", http.StatusBadRequest)
		return
	}

	code := req.FormValue("code")
	token, err := googleOauth2Conf.Exchange(context.Background(), code)

	if err != nil {
		http.Error(res, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userInfo, err := fetchGoogleUserInfo(googleOauth2Conf, token)
	if err != nil {
		http.Error(res, "Failed to fetch user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userToken, err := generateUserToken(db.User{
		Email:          userInfo.Email,
		Username:       userInfo.GivenName,
		ProfilePicture: userInfo.Picture,
	}, "google", userInfo.ID)

	if err != nil {
		http.Error(res, "Failed to generate user token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	tokenCookie := http.Cookie{
		Name:     "token",
		Value:    userToken,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   true,
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 7,
	}

	http.SetCookie(res, &tokenCookie)

	http.Redirect(res, req, "/", http.StatusFound)
}
