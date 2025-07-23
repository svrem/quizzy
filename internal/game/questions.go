package game

import (
	"encoding/json"
	"math/rand"
	"strconv"

	"github.com/svrem/quizzy/internal/utils"
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

func getQuestions(category string, amount int) ([]Question, error) {

	questions := make([]Question, 0, amount)
	usedQuestions := make(map[string]struct{})

	for i := 0; i < amount; i++ {
		var difficulty string

		difficultyNumber := rand.Float32()
		if difficultyNumber < 0.1 {
			difficulty = "hard"
		} else if difficultyNumber < 0.4 {
			difficulty = "medium"
		} else {
			difficulty = "easy"
		}

		row := questionDB.QueryRow(
			"SELECT question, correct_answer, incorrect_answers, category, difficulty, question_type FROM questions WHERE difficulty = ? AND category = ? ORDER BY RANDOM() LIMIT 1",
			difficulty, category,
		)
		var questionDB RawQuestionFromDB
		err := row.Scan(
			&questionDB.Question,
			&questionDB.CorrectAnswer,
			&questionDB.IncorrectAnswers,
			&questionDB.Category,
			&questionDB.Difficulty,
			&questionDB.QuestionType,
		)
		if err != nil {
			continue
		}

		if _, exists := usedQuestions[questionDB.Question]; exists {
			i--
			continue
		}
		usedQuestions[questionDB.Question] = struct{}{}

		var question Question
		question.Category = questionDB.Category + " (" + strconv.Itoa(i+1) + "/" + strconv.Itoa(amount) + ")"
		question.Difficulty = questionDB.Difficulty
		question.Question = questionDB.Question

		incorrectAnswers := []string{}
		json.Unmarshal([]byte(questionDB.IncorrectAnswers), &incorrectAnswers)

		rand.Shuffle(len(incorrectAnswers), func(i, j int) {
			incorrectAnswers[i], incorrectAnswers[j] = incorrectAnswers[j], incorrectAnswers[i]
		})

		question.Answers = append([]string{questionDB.CorrectAnswer}, incorrectAnswers...)
		correctIndex := rand.Intn(len(question.Answers))
		question.Correct = int32(correctIndex)
		question.Answers[0], question.Answers[correctIndex] = question.Answers[correctIndex], question.Answers[0]

		questions = append(questions, question)
	}

	if len(questions) == 0 {
		return nil, nil // No questions found
	}

	return questions, nil
}

func pickThreeRandomCategories() ([]string, error) {
	categories, err := getCategories()

	if err != nil {
		return nil, err
	}

	selectedCategories := make([]string, 0, 3)
	for len(selectedCategories) < 3 {
		randomIndex := rand.Intn(len(categories))

		if utils.Contains(selectedCategories, categories[randomIndex]) {
			continue // Skip if the category is already selected
		}

		selectedCategories = append(selectedCategories, categories[randomIndex])
	}
	return selectedCategories, nil
}
