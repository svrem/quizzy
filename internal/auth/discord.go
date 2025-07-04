package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/svrem/quizzy/internal/db"
)

type DiscordTokenExchangeResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
}

type DiscordUserInfo struct {
	ID            string  `json:"id"`
	Username      string  `json:"username"`
	Discriminator string  `json:"discriminator"`
	Avatar        string  `json:"avatar"`
	PublicFlags   int     `json:"public_flags"`
	Flags         int     `json:"flags"`
	Banner        *string `json:"banner"`
	AccentColor   *int    `json:"accent_color"`
	GlobalName    string  `json:"global_name"`
	Email         string  `json:"email"`
	Verified      bool    `json:"verified"`
	Locale        string  `json:"locale"`
	MFAEnabled    bool    `json:"mfa_enabled"`
	PremiumType   int     `json:"premium_type"`
}

func RedirectToDiscordAuthCodeURL(res http.ResponseWriter, req *http.Request) {
	state := generateState()

	stateCookie := http.Cookie{
		Name:     "discord_oauth_state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		MaxAge:   60 * 10, // 10 minutes
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(res, &stateCookie)

	u, err := url.Parse("https://discord.com/oauth2/authorize?response_type=code&scope=identify+email")

	if err != nil {
		http.Error(res, "Failed to parse Discord OAuth URL", http.StatusInternalServerError)
		return
	}

	q := u.Query()
	q.Set("client_id", os.Getenv("DISCORD_CLIENT_ID"))
	q.Set("client_secret", os.Getenv("DISCORD_CLIENT_SECRET"))
	q.Set("redirect_uri", os.Getenv("DISCORD_REDIRECT_URL"))
	q.Set("state", state)
	u.RawQuery = q.Encode()

	authURL := u.String()
	http.Redirect(res, req, authURL, http.StatusFound)
}

func HandleDiscordOAuthCallback(res http.ResponseWriter, req *http.Request) {
	stateCookie, err := req.Cookie("discord_oauth_state")
	if err != nil {
		http.Error(res, "State cookie not found", http.StatusBadRequest)
		return
	}

	stateQuery := req.URL.Query().Get("state")
	if stateCookie.Value != stateQuery {
		http.Error(res, "Invalid state parameter", http.StatusBadRequest)
		return
	}

	code := req.URL.Query().Get("code")
	if code == "" {
		http.Error(res, "Code parameter is missing", http.StatusBadRequest)
		return
	}

	accessToken, err := fetchDiscordUserAccessToken(code)

	if err != nil {
		http.Error(res, "Failed to exchange code for access token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userInfo, err := fetchDiscordUserInfo(accessToken)
	if err != nil {
		http.Error(res, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userToken, err := generateUserToken(db.User{
		Email:          userInfo.Email,
		Username:       userInfo.Username,
		ProfilePicture: userInfo.Avatar,
		Provider:       "discord",
		ProviderID:     userInfo.ID,
	})

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

func fetchDiscordUserInfo(accessToken string) (*DiscordUserInfo, error) {
	req, err := http.NewRequest("GET", "https://discord.com/api/v10/users/@me", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get user info: %s", resp.Status)
	}

	var userInfo DiscordUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode user info response: %w", err)
	}

	// Construct the avatar URL
	if userInfo.Avatar != "" {
		userInfo.Avatar = fmt.Sprintf("https://cdn.discordapp.com/avatars/%s/%s.png", userInfo.ID, userInfo.Avatar)
	}

	return &userInfo, nil
}

func fetchDiscordUserAccessToken(code string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("redirect_uri", os.Getenv("DISCORD_REDIRECT_URL"))

	req, err := http.NewRequest("POST", "https://discord.com/api/v10/oauth2/token",
		strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.SetBasicAuth(os.Getenv("DISCORD_CLIENT_ID"), os.Getenv("DISCORD_CLIENT_SECRET"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to get access token: %s", resp.Status)
	}

	var tokenResponse DiscordTokenExchangeResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return "", fmt.Errorf("failed to decode token response: %w", err)
	}

	return tokenResponse.AccessToken, nil
}
