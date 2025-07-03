package db

import (
	"os"
	"strconv"
	"testing"
)

func TestUsers(t *testing.T) {
	InitializeDatabase()

	t.Run("CreateMultipleUsers", func(t *testing.T) {
		for i := 0; i < 1000; i++ {
			user := User{
				Email:          "testuser" + strconv.Itoa(i) + "@example.com",
				Username:       "testuser" + strconv.Itoa(i),
				ProfilePicture: "https://example.com/profile.jpg",
				Provider:       "google",
				ProviderID:     "google-id-" + strconv.Itoa(i),
				Streak:         0,
				Score:          0,
			}

			if err := CreateUser(&user); err != nil {
				t.Errorf("Failed to create user %d: %v", i, err)
			}
		}
	})

	t.Run("UpdateManyUsers", func(t *testing.T) {
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

	os.Remove("test.db")
}
