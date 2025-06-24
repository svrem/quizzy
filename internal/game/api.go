package game

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
)

type QuestionSession struct {
	sessionToken  string
	questions     []Question
	questionIndex int
}

func fetchSessionToken() (string, error) {
	resp, err := http.Get("https://opentdb.com/api_token.php?command=request")

	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	data := make(map[string]interface{})
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return "", err
	}

	response_code := data["response_code"].(float64)

	if response_code != 0 {
		return "", fmt.Errorf("failed to fetch session token: %v", data["response_code"])

	}
	// if data["response_code"] != 0 {
	// }

	sessionToken, ok := data["token"].(string)
	if !ok {
		return "", fmt.Errorf("invalid token format")
	}
	return sessionToken, nil
}

func (qs *QuestionSession) FetchQuestions() error {
	println("Fetching questions...")

	url := fmt.Sprintf("https://opentdb.com/api.php?amount=50&token=%s", qs.sessionToken)
	resp, err := http.Get(url)

	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("failed to fetch questions: %s", resp.Status)
	}

	data := make(map[string]interface{})
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return err
	}

	if data["response_code"].(float64) != 0 {
		return fmt.Errorf("failed to fetch questions: %v", data["response_code"])
	}

	questions, ok := data["results"].([]interface{})
	if !ok {
		return fmt.Errorf("invalid questions format")
	}
	qs.questions = []Question{}

	for _, q := range questions {
		answers := []string{}
		answers_interfaces := q.(map[string]interface{})["incorrect_answers"].([]interface{})

		for _, a := range answers_interfaces {
			answers = append(answers, a.(string))
		}

		correct_answer := q.(map[string]interface{})["correct_answer"].(string)
		answers = append(answers, correct_answer)

		correctIndex := rand.Intn(len(answers))
		answers[correctIndex], answers[len(answers)-1] = answers[len(answers)-1], answers[correctIndex]

		questionObject := q.(map[string]interface{})

		question := questionObject["question"].(string)
		difficulty := questionObject["difficulty"].(string)
		category := questionObject["category"].(string)

		new_question := Question{
			Question:   question,
			Answers:    answers,
			Correct:    correctIndex,
			Difficulty: difficulty,
			Category:   category,
		}
		qs.questions = append(qs.questions, new_question)

	}

	qs.questionIndex = 0

	return nil
}

func (qs *QuestionSession) GetQuestion() (Question, error) {
	if qs.questionIndex >= len(qs.questions) {
		if err := qs.FetchQuestions(); err != nil {
			println("Error fetching questions:", err.Error())
			return Question{}, err
		}
	}

	question := qs.questions[qs.questionIndex]
	qs.questionIndex++
	return question, nil
}

func NewQuestionSession() *QuestionSession {
	sessionToken, err := fetchSessionToken()

	if err != nil {
		fmt.Println("Error fetching session token:", err)
		return nil
	}

	qs := &QuestionSession{
		sessionToken:  sessionToken,
		questions:     []Question{},
		questionIndex: 0,
	}
	return qs
}
