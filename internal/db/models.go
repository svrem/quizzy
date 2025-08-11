package db

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func migrateDB() error {
	if err := db.AutoMigrate(&User{}); err != nil {
		return err
	}

	if err := db.AutoMigrate(&UserOAuth{}); err != nil {
		return err
	}

	return nil
}

type User struct {
	gorm.Model
	ID             string `gorm:"unique;primaryKey;type:uuid;"`
	Bot            bool   `gorm:"default:false"`
	Email          string `gorm:"not null"`
	Username       string `gorm:"not null"`
	ProfilePicture string

	OAuthProviders []UserOAuth `gorm:"foreignKey:UserID"`

	Streak    int `gorm:"-:all"`
	MaxStreak int `gorm:"default:0"`
	Score     int `gorm:"default:0"`
}

func (user *User) BeforeCreate(txt *gorm.DB) error {
	user.ID = uuid.NewString()
	return nil
}

type UserOAuth struct {
	ID         uint   `gorm:"primaryKey"`
	UserID     string `gorm:"index;not null"`
	Provider   string `gorm:"not null;uniqueIndex:provider_providerid_idx"`
	ProviderID string `gorm:"not null;uniqueIndex:provider_providerid_idx"`
}
