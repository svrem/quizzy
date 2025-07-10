package game

import (
	"encoding/json"
	"math/rand"
)

func getCategories() ([]string, error) {
	var categories []string

	rows, err := questionDB.Query("SELECT DISTINCT category FROM questions")
	if err != nil {
		return nil, err // Other error
	}
	defer rows.Close()

	for rows.Next() {
		var category string
		if err := rows.Scan(&category); err != nil {
			return nil, err // Scan error
		}
		categories = append(categories, category)
	}

	if err := rows.Err(); err != nil {
		return nil, err // Rows error
	}

	return categories, nil
}

func getQuestion(category string) (Question, error) {

	var difficulty string

	difficultyNumber := rand.Float32()

	if difficultyNumber < 0.1 {
		difficulty = "hard"
	} else if difficultyNumber < 0.4 {
		difficulty = "medium"
	} else {
		difficulty = "easy"
	}

	var question QuestionDB
	err := questionDB.QueryRow("SELECT question, correct_answer, incorrect_answers, category, difficulty, question_type FROM questions WHERE difficulty = ? AND category = ? ORDER BY RANDOM() LIMIT 1", difficulty, category).Scan(
		&question.Question,
		&question.CorrectAnswer,
		&question.IncorrectAnswers,
		&question.Category,
		&question.Difficulty,
		&question.QuestionType,
	)

	if err != nil {
		return Question{}, err // Other error
	}

	incorrectAnswers := []string{}
	json.Unmarshal([]byte(question.IncorrectAnswers), &incorrectAnswers)

	// Convert QuestionDB to Question
	answers := append([]string{question.CorrectAnswer}, incorrectAnswers...)

	correctIndex := rand.Intn(len(answers))
	answers[correctIndex], answers[0] = answers[0], answers[correctIndex]

	return Question{
		Question:   question.Question,
		Answers:    answers,
		Correct:    correctIndex,
		Difficulty: question.Difficulty,
		Category:   question.Category,
	}, nil

}
