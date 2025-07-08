package game

import (
	"database/sql"
	"errors"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var questionDB *sql.DB

func InitializeQuestionDB() error {

	if _, err := os.Stat("data/questiondb.db"); errors.Is(err, os.ErrNotExist) {
		return errors.New("questions database does not exist at the specified path (data/questiondb.db)")
	}

	var err error
	questionDB, err = sql.Open("sqlite3", "data/questiondb.db")

	if err != nil {
		return err
	}

	return nil
}

func CloseQuestionDB() error {
	if questionDB != nil {
		return questionDB.Close()
	}
	return nil
}
