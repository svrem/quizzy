package game

import (
	"encoding/json"
	"math/rand"
)

func GetQuestion() (Question, error) {
	db, err := OpenQuestionsDB()
	if err != nil {
		return Question{}, err
	}
	defer db.Close()

	var difficulty string

	difficultyNumber := rand.Float32()

	if difficultyNumber < 0.1 {
		difficulty = "hard"
	} else if difficultyNumber < 0.4 {
		difficulty = "medium"
	} else {
		difficulty = "easy"
	}

	println(difficultyNumber, difficulty)

	var question QuestionDB
	err = db.QueryRow("SELECT question, correct_answer, incorrect_answers, category, difficulty, question_type FROM questions WHERE difficulty = ? ORDER BY RANDOM() LIMIT 1", difficulty).Scan(
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
