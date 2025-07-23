package db

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"strconv"
	"testing"
	"time"
)

type FakeUserResp struct {
	Results []struct {
		Gender string `json:"gender"`
		Name   struct {
			Title string `json:"title"`
			First string `json:"first"`
			Last  string `json:"last"`
		} `json:"name"`
		Email string `json:"email"`
		Login struct {
			UUID     string `json:"uuid"`
			Username string `json:"username"`
			Password string `json:"password"`
			Salt     string `json:"salt"`
			Md5      string `json:"md5"`
			Sha1     string `json:"sha1"`
			Sha256   string `json:"sha256"`
		} `json:"login"`
		Dob struct {
			Date time.Time `json:"date"`
			Age  int       `json:"age"`
		} `json:"dob"`
		Registered struct {
			Date time.Time `json:"date"`
			Age  int       `json:"age"`
		} `json:"registered"`
		Phone string `json:"phone"`
		Cell  string `json:"cell"`
		ID    struct {
			Name  string `json:"name"`
			Value string `json:"value"`
		} `json:"id"`
		Picture struct {
			Large     string `json:"large"`
			Medium    string `json:"medium"`
			Thumbnail string `json:"thumbnail"`
		} `json:"picture"`
		Nat string `json:"nat"`
	} `json:"results"`
	Info struct {
		Seed    string `json:"seed"`
		Results int    `json:"results"`
		Page    int    `json:"page"`
		Version string `json:"version"`
	} `json:"info"`
}

func TestUsers(t *testing.T) {
	// Use in-memory SQLite database for testing
	if err := InitializeDatabaseWithPath("test.db"); err != nil {
		t.Fatalf("Failed to initialize database: %v", err)
	}

	t.Run("CreateMultipleUsers", func(t *testing.T) {
		// fetch from https://randomuser.me/api/ and unmarshal the response
		resp, err := http.Get("https://randomuser.me/api/?results=1000")
		if err != nil {
			t.Fatalf("Failed to fetch user data: %v", err)
		}
		defer resp.Body.Close()

		var fakeUserResp FakeUserResp
		if err := json.NewDecoder(resp.Body).Decode(&fakeUserResp); err != nil {
			t.Fatalf("Failed to decode user data: %v", err)
		}

		println(len(fakeUserResp.Results))

		for i, result := range fakeUserResp.Results {

			user := User{
				Email:          result.Email,
				Username:       result.Login.Username,
				Provider:       "google",
				ProviderID:     "google-id-" + strconv.Itoa(i),
				ProfilePicture: result.Picture.Thumbnail,
				Streak:         0,
				Score:          rand.Intn(10000),
			}

			if err := CreateUser(&user); err != nil {
				t.Errorf("Failed to create user %d: %v", i, err)
			}
		}
	})

	t.Run("UpdateManyUsers", func(t *testing.T) {

		return
		var users []*User
		if err := db.Find(&users).Error; err != nil {
			t.Fatalf("Failed to fetch users: %v", err)
		}

		for i, user := range users {
			user.Streak = 1
			user.Score = 10
			users[i] = user
		}

		if err := UpdateManyUsers(users); err != nil {
			t.Errorf("Failed to update users: %v", err)
		}

		if err := db.Find(&users).Error; err != nil {
			t.Fatalf("Failed to fetch updated users: %v", err)
		}

		for _, user := range users {
			if user.Streak != 1 || user.Score != 10 {
				t.Errorf("User %s has incorrect values: Streak=%d, Score=%d", user.Username, user.Streak, user.Score)
			}
		}
	})
}
