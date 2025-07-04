package db

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func migrateDB() error {
	if err := db.AutoMigrate(&User{}); err != nil {
		return err
	}

	return nil
}

type User struct {
	gorm.Model
	ID             string `gorm:"unique;primaryKey;type:uuid;"`
	Email          string `gorm:"not null"`
	Username       string `gorm:"not null"`
	ProfilePicture string

	Provider   string `gorm:"uniqueIndex:idx_provider_provider_id;not null"`
	ProviderID string `gorm:"uniqueIndex:idx_provider_provider_id;not null"`

	Streak    int `gorm:"default:0"`
	MaxStreak int `gorm:"default:0"`
	Score     int `gorm:"default:0"`
}

func (user *User) BeforeCreate(txt *gorm.DB) error {
	user.ID = uuid.NewString()
	return nil
}
