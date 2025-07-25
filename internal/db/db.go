package db

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func InitializeDatabase() error {
	return InitializeDatabaseWithPath("data/test.db")
}

func InitializeDatabaseWithPath(dbPath string) error {
	var err error
	db, err = gorm.Open(sqlite.Open(dbPath))
	if err != nil {
		return err
	}

	if err := migrateDB(); err != nil {
		return err
	}

	return nil
}
