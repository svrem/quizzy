package game

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

func OpenQuestionsDB() (*sql.DB, error) {

	db, err := sql.Open("sqlite3", "data/questiondb.db")

	if err != nil {
		return nil, err
	}

	return db, nil
}
