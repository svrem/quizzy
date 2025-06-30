package game

import (
	"database/sql"
	"errors"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

func openQuestionsDB() (*sql.DB, error) {

	if _, err := os.Stat("/path/to/whatever"); errors.Is(err, os.ErrNotExist) {
		return nil, errors.New("questions database does not exist")
	}

	db, err := sql.Open("sqlite3", "data/questiondb.db")

	if err != nil {
		return nil, err
	}

	return db, nil
}
