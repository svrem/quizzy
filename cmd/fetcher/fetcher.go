package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type SessionResponse struct {
	ResponseCode    int    `json:"response_code"`
	ResponseMessage string `json:"response_message"`
	Token           string `json:"token"`
}

type Question struct {
	QuestionType     string   `json:"type"`
	Difficulty       string   `json:"difficulty"`
	Category         string   `json:"category"`
	Question         string   `json:"question"`
	CorrectAnswer    string   `json:"correct_answer"`
	IncorrectAnswers []string `json:"incorrect_answers"`
}

func main() {
	sessionToken, err := fetchSessionToken()
	if err != nil {
		log.Println("Failed to fetch session token:", err.Error())
		return
	}

	// create data folder if it doesn't exist
	err = os.MkdirAll("data", os.ModePerm)
	if err != nil {
		log.Println("Failed to create data folder:", err.Error())
		return
	}

	db, err := sql.Open("sqlite3", "data/questiondb.db")

	if err != nil {
		log.Println("Failed to open db: ", err.Error())
		return
	}
	defer db.Close()

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT UNIQUE, correct_answer TEXT, incorrect_answers TEXT, category TEXT, difficulty TEXT, question_type TEXT)")
	if err != nil {
		log.Println("Failed to create table:", err.Error())
		return
	}

	for {
		questions, err := fetchQuestions(sessionToken)
		if err != nil {
			log.Println("Failed to fetch questions:", err.Error())
			return
		}

		err = addQuestionsToDB(db, questions)

		if err != nil {
			log.Println("Failed to add questions to db:", err.Error())
			return
		}

		total, err := countQuestionsInDB(db)
		if err != nil {
			log.Println("Failed to count questions in db:", err.Error())
			return
		}

		log.Println("Total questions in database:", total)

		time.Sleep(10 * time.Second)
	}
}

func countQuestionsInDB(db *sql.DB) (int, error) {
	var total int
	err := db.QueryRow("SELECT COUNT(*) FROM questions").Scan(&total)
	if err != nil {
		log.Println("Failed to count questions in db:", err.Error())
		return 0, err
	}
	return total, nil
}

func fetchSessionToken() (string, error) {
	sessionResp, err := http.Get("https://opentdb.com/api_token.php?command=request")
	if err != nil {
		return "", fmt.Errorf("failed to fetch session token: %v", err)
	}
	defer sessionResp.Body.Close()

	if sessionResp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch session token: status code %d", sessionResp.StatusCode)
	}
	sessionBody, err := io.ReadAll(sessionResp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read session token response: %v", err)
	}

	var sessionResponse SessionResponse
	err = json.Unmarshal(sessionBody, &sessionResponse)
	if err != nil {
		return "", fmt.Errorf("failed to parse session token response: %v", err)
	}

	if sessionResponse.ResponseCode != 0 {
		return "", fmt.Errorf("failed to fetch session token: %s", sessionResponse.ResponseMessage)
	}

	return sessionResponse.Token, nil
}

func fetchQuestions(token string) ([]Question, error) {
	questionsResp, err := http.Get("https://opentdb.com/api.php?amount=50&token=" + token)
	if err != nil {
		return nil, err
	}
	defer questionsResp.Body.Close()

	if questionsResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch questions: status code %d", questionsResp.StatusCode)
	}

	questionsBody, err := io.ReadAll(questionsResp.Body)
	if err != nil {
		return nil, err
	}

	var questionsResponse struct {
		ResponseCode int        `json:"response_code"`
		Results      []Question `json:"results"`
	}

	err = json.Unmarshal(questionsBody, &questionsResponse)
	if err != nil {
		return nil, err
	}

	if questionsResponse.ResponseCode != 0 {
		return nil, fmt.Errorf("failed to fetch questions: %s", string(questionsBody))
	}

	return questionsResponse.Results, nil
}

func addQuestionsToDB(db *sql.DB, questions []Question) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare("INSERT OR IGNORE INTO questions (question, correct_answer, incorrect_answers, category, difficulty, question_type) VALUES (?, ?, ?, ?, ?, ?)")

	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, question := range questions {
		incorrectAnswersJSON, err := json.Marshal(question.IncorrectAnswers)
		if err != nil {
			return err
		}

		_, err = stmt.Exec(question.Question, question.CorrectAnswer, string(incorrectAnswersJSON), question.Category, question.Difficulty, question.QuestionType)
		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}
